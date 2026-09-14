import { injectable, inject } from 'tsyringe';
import sharp from 'sharp';
import type { ImagePurpose, ImageVariantName } from '../queue/types/image.job.types.js';
import type { ILogger } from '../../shared/logger/logger.interface.js';
import { InfrastructureTokens } from '../container/tokens/infrastructure.tokens.js';

export interface ImageVariantSpec {
  name: ImageVariantName;
  width: number;
  height?: number; // Optional if we want sharp to maintain aspect ratio
}

@injectable()
export class ImageProcessingService {
  private readonly logger: ILogger;

  // Variant specifications per purpose
  private readonly variantSpecs: Record<ImagePurpose, ImageVariantSpec[]> = {
    USER_AVATAR: [
      { name: 'thumbnail', width: 96, height: 96 },
      { name: 'small', width: 256, height: 256 },
    ],
    RESTAURANT_LOGO: [
      { name: 'small', width: 256, height: 256 },
      { name: 'medium', width: 512, height: 512 },
    ],
    RESTAURANT_COVER: [
      { name: 'medium', width: 1024, height: 576 },
      { name: 'large', width: 1920, height: 1080 },
    ],
    MENU_ITEM: [
      { name: 'thumbnail', width: 160, height: 160 },
      { name: 'small', width: 320, height: 320 },
      { name: 'medium', width: 640, height: 640 },
      { name: 'large', width: 1280, height: 1280 },
    ],
    MENU_CATEGORY: [
      { name: 'small', width: 320, height: 240 },
      { name: 'medium', width: 640, height: 480 },
    ],
  };

  constructor(
    @inject(InfrastructureTokens.Logger)
    logger: ILogger,
  ) {
    this.logger = logger.child({ component: 'ImageProcessingService' });
  }

  getSpecs(purpose: ImagePurpose): ImageVariantSpec[] {
    return this.variantSpecs[purpose] || [];
  }

  async processVariant(
    inputBuffer: Buffer,
    spec: ImageVariantSpec,
  ): Promise<{
    buffer: Buffer;
    mimeType: string;
    width: number;
    height: number;
    sizeBytes: number;
  }> {
    try {
      let transformer = sharp(inputBuffer)
        .rotate() // Auto-orient based on EXIF
        .resize({
          width: spec.width,
          height: spec.height,
          fit: 'cover',
          position: 'centre',
          withoutEnlargement: true,
        });

      // Output as WebP
      transformer = transformer.webp({ quality: 80 });

      const { data, info } = await transformer.toBuffer({ resolveWithObject: true });

      return {
        buffer: data,
        mimeType: 'image/webp',
        width: info.width,
        height: info.height,
        sizeBytes: info.size,
      };
    } catch (error) {
      this.logger.error('Failed to process image variant', error, { spec });
      throw error;
    }
  }

  async getMetadata(inputBuffer: Buffer) {
    const metadata = await sharp(inputBuffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
    };
  }
}
