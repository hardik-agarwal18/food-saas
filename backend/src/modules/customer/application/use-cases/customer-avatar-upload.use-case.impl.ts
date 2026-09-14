import { injectable, inject } from 'tsyringe';
import { CustomerAvatarUploadUseCase } from './customer-avatar-upload.use-case.js';
import { CustomerTokens } from '../../infrastructure/persistence/tokens/customer.tokens.js';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.js';
import { IdentityTokens } from '../../../identity/infrastructure/persistence/tokens/identity.tokens.js';
import type { IUserRepository } from '../../../identity/domain/repositories/user.repository.js';
import { InfrastructureTokens } from '../../../../infrastructure/container/index.js';
import type {
  FileStorage,
  CompletedPart,
} from '../../../../shared/contracts/storage/file-storage.js';
import { CustomerAvatarUploadInput } from '../dto/customer-avatar-upload.dto.js';
import { validateCustomerAvatar } from '../../validators/customer-avatar.validator.js';
import { AuthenticationError } from '../../../../shared/errors/AuthenticationError.js';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error.js';
import type { ILogger } from '../../../../shared/logger/logger.interface.js';
import { addImageProcessingJob } from '../../../../infrastructure/queue/queues/image.queue.js';
import { PrismaClient, MediaProcessingStatus } from '../../../../generated/prisma/client.js';

const PART_SIZE = 2 * 1024 * 1024;

@injectable()
export class CustomerAvatarUploadUseCaseImpl implements CustomerAvatarUploadUseCase {
  constructor(
    @inject(IdentityTokens.UserRepository)
    private readonly userRepo: IUserRepository,

    @inject(CustomerTokens.CustomerRepository)
    private readonly customerRepo: ICustomerRepository,

    @inject(InfrastructureTokens.FileStorage)
    private readonly fileStorage: FileStorage,

    @inject(InfrastructureTokens.PrismaClient)
    private readonly prisma: PrismaClient,

    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,
  ) {}

  async execute(input: CustomerAvatarUploadInput): Promise<void> {
    const userId = input.userId;

    this.logger.info('Executing CustomerAvatarUploadUseCase (Multipart)', { userId });

    await validateCustomerAvatar(input.file);

    const user = await this.userRepo.findById(userId);

    if (!user) {
      this.logger.warn('User not found during avatar upload', { userId });
      throw new AuthenticationError('User not found');
    }

    const customer = await this.customerRepo.findByUserId(userId);

    if (!customer) {
      this.logger.warn('Customer not found during avatar upload', { userId });
      throw new CustomerNotFoundError();
    }

    const extension = this.getExtension(input.file.originalname);
    const key = `images/users/${customer.getId()}/avatar/original${extension}`;

    let uploadId: string | null = null;

    try {
      // create the multipart upload
      const multipartUpload = await this.fileStorage.createMultipartUpload({
        key,
        contentType: input.file.mimetype,
      });

      uploadId = multipartUpload.uploadId;

      // split avatar into parts
      const parts = this.splitIntoParts(input.file.buffer);
      const completedParts: CompletedPart[] = [];

      // upload each part
      for (let index = 0; index < parts.length; index++) {
        const partNumber = index + 1;
        const part = parts[index];

        const presigned = await this.fileStorage.createPresignedUploadPartUrl({
          key,
          uploadId,
          partNumber,
        });

        const response = await fetch(presigned.url, {
          method: 'PUT',
          headers: {
            'Content-Type': input.file.mimetype,
          },
          body: new Uint8Array(part),
        });

        if (!response.ok) {
          throw new Error(`Failed to upload avatar part: ${response.status}`);
        }

        const etag = response.headers.get('etag');

        if (!etag) {
          throw new Error(`Missing Etag for avatar part ${partNumber}`);
        }

        completedParts.push({ partNumber, etag });
      }

      // Complete multipart upload
      await this.fileStorage.completeMultipartUpload({
        key,
        uploadId,
        parts: completedParts,
      });

      // 2. Create Media record
      const media = await this.prisma.media.create({
        data: {
          originalKey: key,
          mimeType: input.file.mimetype,
          sizeBytes: input.file.size,
          processingStatus: MediaProcessingStatus.PENDING,
        },
      });

      // 3. Update customer.avatarMediaId
      await this.prisma.customer.update({
        where: { id: customer.getId() },
        data: { avatarMediaId: media.id },
      });

      // 4. Enqueue processing job
      await addImageProcessingJob({
        mediaId: media.id,
        sourceKey: key,
        purpose: 'USER_AVATAR',
        entityId: customer.getId(),
        mimeType: input.file.mimetype,
        requestedVariants: ['thumbnail', 'small'],
      });

      this.logger.info('Multipart avatar original uploaded and processing enqueued', {
        userId,
        key,
      });
    } catch (error) {
      if (uploadId) {
        await this.safeAbort(key, uploadId);
      }
      this.logger.error('Failed to upload avatar via multipart', error, { userId });
      throw error;
    }
  }

  private splitIntoParts(buffer: Buffer): Buffer[] {
    const parts: Buffer[] = [];
    for (let offset = 0; offset < buffer.length; offset += PART_SIZE) {
      parts.push(buffer.subarray(offset, Math.min(offset + PART_SIZE, buffer.length)));
    }
    return parts;
  }

  private getExtension(filename: string): string {
    const index = filename.lastIndexOf('.');
    if (index === -1) {
      return '';
    }
    return filename.slice(index).toLowerCase();
  }

  private async safeAbort(key: string, uploadId: string): Promise<void> {
    try {
      await this.fileStorage.abortMultipartUpload(key, uploadId);
    } catch {}
  }
}
