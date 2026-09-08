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
import type { ILogger } from '../../../../shared/logger/logger.interface.js';
import { addAvatarUploadJob } from '../../../../infrastructure/queue/queues/avatar.queue.js';

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

    const filename = input.file.originalname;
    const extension = this.getExtension(filename);
    const tempKey = `avatar-temp/${crypto.randomUUID()}${extension}`;

    try {
      // Upload temporary object
      await this.fileStorage.upload({
        key: tempKey,
        body: input.file.buffer,
        contentType: input.file.mimetype,
        contentLength: input.file.size,
      });

      // Enqueue job for background processing
      await addAvatarUploadJob({
        userId,
        tempObjectKey: tempKey,
        originalName: filename,
        mimeType: input.file.mimetype,
      });

      this.logger.info('Temporary avatar uploaded and job enqueued', { userId, tempKey });
    } catch (error) {
      this.logger.error('Failed to upload temp avatar or enqueue job', error, { userId });
      throw error;
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
