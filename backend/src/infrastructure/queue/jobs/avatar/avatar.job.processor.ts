import { injectable, inject } from 'tsyringe';
import { InfrastructureTokens } from '../../../container/tokens/index.js';
import type { FileStorage } from '../../../../shared/contracts/storage/file-storage.js';
import { Job } from 'bullmq';
import { AvatarJobName, UploadAvatarJobData } from '../../types/avatar.job.types.js';
import type { ILogger } from '../../../../shared/logger/logger.interface.js';
import { CustomerTokens } from '../../../../modules/customer/infrastructure/persistence/tokens/customer.tokens.js';
import type { ICustomerRepository } from '../../../../modules/customer/domain/repositories/customer.repository.js';
import { CustomerAvatarUrl } from '../../../../modules/customer/domain/value-objects/customer-avatar.vo.js';
import { CustomerNotFoundError } from '../../../../modules/customer/domain/errors/customer-not-found.error.js';

@injectable()
export class AvatarJobProcessor {
  private readonly logger: ILogger;

  constructor(
    @inject(InfrastructureTokens.FileStorage)
    private readonly fileStorage: FileStorage,

    @inject(CustomerTokens.CustomerRepository)
    private readonly customerRepo: ICustomerRepository,

    @inject(InfrastructureTokens.Logger)
    logger: ILogger,
  ) {
    this.logger = logger.child({ component: 'AvatarJobProcessor' });
  }

  async process(job: Job): Promise<void> {
    this.logger.info(`Starting to process avatar job`, {
      jobId: job.id,
      jobName: job.name,
      attempt: job.attemptsMade,
    });

    try {
      if (job.name === AvatarJobName.UPLOAD_AVATAR) {
        const data = job.data as UploadAvatarJobData;
        await this.handleUploadAvatar(data);
        return;
      }

      this.logger.error(`Unsupported avatar job type received`, undefined, {
        jobName: job.name,
      });
      throw new Error(`Unsupported avatar job: ${job.name}`);
    } catch (error) {
      this.logger.error(`Failed to process avatar job`, error, {
        jobId: job.id,
        jobName: job.name,
      });
      throw error;
    }
  }

  private async handleUploadAvatar(data: UploadAvatarJobData): Promise<void> {
    const { userId, tempObjectKey, originalName } = data;

    this.logger.debug(`Processing avatar upload`, { userId, tempObjectKey });

    const customer = await this.customerRepo.findByUserId(userId);

    if (!customer) {
      this.logger.warn(`Customer not found for async avatar upload`, { userId });
      throw new CustomerNotFoundError();
    }

    const oldAvatarUrl = customer.getAvatarUrl();
    const extension = this.getExtension(originalName);
    const finalKey = `customers/${userId}/avatar/${crypto.randomUUID()}${extension}`;

    try {
      // Copy the temporary object to the final destination
      const storedFile = await this.fileStorage.copy(tempObjectKey, finalKey);

      customer.removeAvatarUrl();
      customer.changeAvatarUrl(CustomerAvatarUrl.create(storedFile.url));

      await this.customerRepo.update(customer);

      this.logger.info(`Successfully uploaded final avatar via worker`, { userId, finalKey });

      // Clean up the temporary object
      try {
        await this.fileStorage.delete(tempObjectKey);
      } catch (err) {
        this.logger.warn(`Failed to delete temporary avatar object`, { tempObjectKey });
      }

      // Clean up the old avatar if it existed
      if (oldAvatarUrl) {
        const oldAvatarUrlValue = oldAvatarUrl.getValue();
        if (oldAvatarUrlValue) {
          const oldAvatarKey = this.extractStorageKey(oldAvatarUrlValue);
          if (oldAvatarKey) {
            try {
              await this.fileStorage.delete(oldAvatarKey);
            } catch (err) {
              this.logger.warn(`Failed to delete old avatar object`, { oldAvatarKey });
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to copy and set avatar`, error, { userId, tempObjectKey });
      throw error;
    }
  }

  private getExtension(filename: string): string {
    const index = filename.lastIndexOf('.');
    if (index === -1) return '';
    return filename.slice(index).toLowerCase();
  }

  private extractStorageKey(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
    } catch {
      return null;
    }
  }
}
