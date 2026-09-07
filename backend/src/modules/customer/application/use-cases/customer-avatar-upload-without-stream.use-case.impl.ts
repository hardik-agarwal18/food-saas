import { injectable, inject } from 'tsyringe';
import { IdentityTokens } from '../../../identity/infrastructure/persistence/tokens/identity.tokens.js';
import type { IUserRepository } from '../../../identity/domain/repositories/user.repository.js';
import { CustomerTokens } from '../../infrastructure/persistence/tokens/customer.tokens.js';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.js';
import { InfrastructureTokens } from '../../../../infrastructure/container/index.js';
import type { FileStorage } from '../../../../shared/contracts/storage/file-storage.js';
import { CustomerAvatarUploadWithoutStreamUseCase } from './customer-avatar-upload-without-stream.use-case.js';
import { CustomerAvatarUploadWithoutStreamInput } from '../dto/customer-avatar-upload-without-stream.dto.js';
import { AuthenticationError } from '../../../../shared/errors/AuthenticationError.js';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error.js';
import { validateCustomerAvatar } from '../../validators/customer-avatar.validator.js';
import { CustomerAvatarUrl } from '../../domain/value-objects/customer-avatar.vo.js';
import type { ILogger } from '../../../../shared/logger/logger.interface.js';

@injectable()
export class CustomerAvatarUploadWithoutStreamUseCaseImpl implements CustomerAvatarUploadWithoutStreamUseCase {
  constructor(
    @inject(IdentityTokens.UserRepository)
    private readonly useRepo: IUserRepository,

    @inject(CustomerTokens.CustomerRepository)
    private readonly customerRepo: ICustomerRepository,

    @inject(InfrastructureTokens.FileStorage)
    private readonly fileStorage: FileStorage,

    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,
  ) {}

  async execute(input: CustomerAvatarUploadWithoutStreamInput): Promise<void> {
    const userId = input.userId;

    this.logger.info('Executing CustomerAvatarUploadWithoutStreamUseCase', { userId });

    await validateCustomerAvatar(input.file);

    const user = await this.useRepo.findById(userId);

    if (!user) {
      this.logger.warn('User not found during avatar upload', { userId });
      throw new AuthenticationError('User not found');
    }

    const customer = await this.customerRepo.findByUserId(userId);

    if (!customer) {
      this.logger.warn('Customer not found during avatar upload', { userId });
      throw new CustomerNotFoundError();
    }

    const oldAvatarUrl = customer.getAvatarUrl();

    const filename = input.file.originalname;
    const extension = this.getExtension(filename);

    const key = `customers/${input.userId}/avatar/${crypto.randomUUID()}${extension}`;

    try {
      const response = await this.fileStorage.upload({
        key,
        body: input.file.buffer,
        contentType: input.file.mimetype,
        contentLength: input.file.size,
      });

      const avatarUrl = response.url;

      customer.removeAvatarUrl();
      customer.changeAvatarUrl(CustomerAvatarUrl.create(avatarUrl));

      await this.customerRepo.update(customer);

      this.logger.info('Avatar uploaded successfully without stream', { userId, key });

      if (oldAvatarUrl) {
        const oldAvatarUrlValue = oldAvatarUrl.getValue();
        if (oldAvatarUrlValue) {
          const oldAvatarKey = this.extractStorageKey(oldAvatarUrlValue);
          if (oldAvatarKey) {
            try {
              await this.fileStorage.delete(oldAvatarKey);
            } catch (err) {
              this.logger.error('Failed to delete old avatar', err, { userId, oldAvatarKey });
            }
          }
        }
      }
    } catch (error) {
      this.logger.error('Failed to upload avatar without stream', error, { userId });
      throw error;
    }
  }

  private extractStorageKey(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
    } catch {
      return null;
    }
  }

  private getExtension(filename: string): string {
    const index = filename.lastIndexOf('.');

    if (index === -1) {
      return '';
    }

    return filename.slice(index).toLowerCase();
  }
}
