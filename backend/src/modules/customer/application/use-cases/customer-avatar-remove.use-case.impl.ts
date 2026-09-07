import { injectable, inject } from 'tsyringe';
import { CustomerAvatarRemoveUseCase } from './customer-avatar-remove.use-case.js';
import { IdentityTokens } from '../../../identity/infrastructure/persistence/tokens/identity.tokens.js';
import type { IUserRepository } from '../../../identity/domain/repositories/user.repository.js';
import { CustomerTokens } from '../../infrastructure/persistence/tokens/customer.tokens.js';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.js';
import { InfrastructureTokens } from '../../../../infrastructure/container/index.js';
import type { FileStorage } from '../../../../shared/contracts/storage/file-storage.js';
import { AuthenticationError } from '../../../../shared/errors/AuthenticationError.js';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error.js';
import type { ILogger } from '../../../../shared/logger/logger.interface.js';

@injectable()
export class CustomerAvatarRemoveUseCaseImpl implements CustomerAvatarRemoveUseCase {
  constructor(
    @inject(IdentityTokens.UserRepository)
    private readonly userRepo: IUserRepository,

    @inject(CustomerTokens.CustomerRepository)
    private readonly customerRepo: ICustomerRepository,

    @inject(InfrastructureTokens.FileStorage)
    private readonly fileStorage: FileStorage,

    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,
  ) {}

  async execute(input: { userId: string }): Promise<void> {
    const userId = input.userId;

    this.logger.info('Executing CustomerAvatarRemoveUseCase', { userId });

    const user = await this.userRepo.findById(userId);

    if (!user) {
      this.logger.warn('User not found during avatar removal', { userId });
      throw new AuthenticationError('User not found');
    }

    const customer = await this.customerRepo.findByUserId(userId);

    if (!customer) {
      this.logger.warn('Customer not found during avatar removal', { userId });
      throw new CustomerNotFoundError();
    }

    const avatarUrl = customer.getAvatarUrl();

    if (!avatarUrl) {
      this.logger.info('Customer has no avatar to remove', { userId });
      return;
    }

    const avatarUrlValue = avatarUrl.getValue();

    if (!avatarUrlValue) {
      return;
    }

    const avatarKey = this.extractStorageKey(avatarUrlValue);

    customer.removeAvatarUrl();

    await this.customerRepo.update(customer);

    this.logger.info('Customer avatar removed from profile successfully', { userId });

    if (avatarKey) {
      try {
        await this.fileStorage.delete(avatarKey);
        this.logger.info('Avatar file deleted from storage successfully', { userId, avatarKey });
      } catch (err) {
        this.logger.error('Failed to delete avatar from storage', err, { userId, avatarKey });
      }
    }
  }

  private extractStorageKey(avatarUrl: string): string | null {
    try {
      const url = new URL(avatarUrl);

      const key = url.pathname.replace(/^\/+/, '');

      return key ? decodeURIComponent(key) : null;
    } catch {
      return null;
    }
  }
}
