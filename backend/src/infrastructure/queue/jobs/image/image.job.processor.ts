import { injectable, inject } from 'tsyringe';
import { InfrastructureTokens } from '../../../container/tokens/index.js';
import type { FileStorage } from '../../../../shared/contracts/storage/file-storage.js';
import { Job } from 'bullmq';
import { ImageJobName, type ImageProcessingJobData } from '../../types/image.job.types.js';
import type { ILogger } from '../../../../shared/logger/logger.interface.js';
import { PrismaClient, MediaProcessingStatus } from '../../../../generated/prisma/client.js';
import {
  ImageProcessingService,
  type ImageVariantSpec,
} from '../../../media/image-processing.service.js';

@injectable()
export class ImageJobProcessor {
  private readonly logger: ILogger;

  constructor(
    @inject(InfrastructureTokens.FileStorage)
    private readonly fileStorage: FileStorage,

    @inject(InfrastructureTokens.PrismaClient)
    private readonly prisma: PrismaClient,

    @inject(InfrastructureTokens.ImageProcessingService)
    private readonly imageProcessingService: ImageProcessingService,

    @inject(InfrastructureTokens.Logger)
    logger: ILogger,
  ) {
    this.logger = logger.child({ component: 'ImageJobProcessor' });
  }

  async process(job: Job): Promise<void> {
    this.logger.info(`Starting to process image job`, {
      jobId: job.id,
      jobName: job.name,
      attempt: job.attemptsMade,
    });

    try {
      if (job.name === ImageJobName.PROCESS_IMAGE) {
        const data = job.data as ImageProcessingJobData;
        await this.handleProcessImage(data);
        return;
      }

      this.logger.error(`Unsupported image job type received`, undefined, {
        jobName: job.name,
      });
      throw new Error(`Unsupported image job: ${job.name}`);
    } catch (error) {
      this.logger.error(`Failed to process image job`, error, {
        jobId: job.id,
        jobName: job.name,
      });
      throw error;
    }
  }

  private async handleProcessImage(data: ImageProcessingJobData): Promise<void> {
    const { mediaId, sourceKey, purpose, entityId, requestedVariants } = data;

    this.logger.debug(`Processing image`, { mediaId, purpose, entityId });

    // 1. Mark Media as PROCESSING
    await this.prisma.media.update({
      where: { id: mediaId },
      data: { processingStatus: MediaProcessingStatus.PROCESSING },
    });

    try {
      // 2. Download original
      const originalBuffer = await this.fileStorage.download(sourceKey);

      // 3. Determine variants to generate
      const specs = this.imageProcessingService.getSpecs(purpose);
      const specsToProcess = requestedVariants
        ? specs.filter((s) => requestedVariants.includes(s.name))
        : specs;

      // 4. Process and upload variants
      for (const spec of specsToProcess) {
        await this.processAndUploadVariant(
          originalBuffer,
          mediaId,
          sourceKey,
          purpose,
          entityId,
          spec,
        );
      }

      // 5. Mark Media as COMPLETED
      await this.prisma.media.update({
        where: { id: mediaId },
        data: { processingStatus: MediaProcessingStatus.COMPLETED },
      });

      this.logger.info(`Successfully processed image variants`, { mediaId });
    } catch (error) {
      this.logger.error(`Image processing failed`, error, { mediaId, sourceKey });

      // Mark Media as FAILED
      await this.prisma.media.update({
        where: { id: mediaId },
        data: { processingStatus: MediaProcessingStatus.FAILED },
      });

      throw error;
    }
  }

  private async processAndUploadVariant(
    originalBuffer: Buffer,
    mediaId: string,
    sourceKey: string,
    purpose: string,
    entityId: string,
    spec: ImageVariantSpec,
  ): Promise<void> {
    const variantKey = this.generateVariantKey(sourceKey, purpose, entityId, spec.name);

    // Process using sharp
    const { buffer, mimeType, width, height, sizeBytes } =
      await this.imageProcessingService.processVariant(originalBuffer, spec);

    // Upload to file storage
    await this.fileStorage.upload({
      key: variantKey,
      body: buffer,
      contentType: mimeType,
      contentLength: sizeBytes,
    });

    // Upsert variant record in DB (idempotent)
    await this.prisma.mediaVariant.upsert({
      where: {
        mediaId_name: {
          mediaId: mediaId,
          name: spec.name,
        },
      },
      update: {
        objectKey: variantKey,
        width,
        height,
        sizeBytes,
        mimeType,
      },
      create: {
        mediaId,
        name: spec.name,
        objectKey: variantKey,
        width,
        height,
        sizeBytes,
        mimeType,
      },
    });
  }

  private generateVariantKey(
    sourceKey: string,
    purpose: string,
    entityId: string,
    variantName: string,
  ): string {
    // Determine the base path based on purpose
    let basePath = 'images';

    switch (purpose) {
      case 'USER_AVATAR':
        basePath = `images/users/${entityId}/avatar`;
        break;
      case 'RESTAURANT_LOGO':
        basePath = `images/restaurants/${entityId}/logo`;
        break;
      case 'RESTAURANT_COVER':
        basePath = `images/restaurants/${entityId}/cover`;
        break;
      case 'MENU_ITEM':
        basePath = `images/menu-items/${entityId}`;
        break;
      case 'MENU_CATEGORY':
        basePath = `images/menu-categories/${entityId}`;
        break;
    }

    // Always output as webp
    return `${basePath}/${variantName}.webp`;
  }
}
