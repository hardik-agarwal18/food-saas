import { injectable, inject } from 'tsyringe';
import { GetCustomerProfileUseCase } from './get-customer-profile.use-case.js';
import { GetCustomerProfileResult } from '../dto/get-customer-profile-result.dto.js';
import { GetCustomerProfileInput } from '../dto/get-customer-profile.dto.js';
import { IdentityTokens } from '../../../identity/infrastructure/persistence/tokens/identity.tokens.js';
import type { IUserRepository } from '../../../identity/domain/repositories/user.repository.js';
import { CustomerTokens } from '../../infrastructure/persistence/tokens/customer.tokens.js';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.js';
import { AuthenticationError } from '../../../../shared/errors/AuthenticationError.js';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error.js';
import { InfrastructureTokens } from '../../../../infrastructure/container/index.js';
import type { ILogger } from '../../../../shared/logger/logger.interface.js';

@injectable()
export class GetCustomerProfileUseCaseImpl implements GetCustomerProfileUseCase {
  constructor(
    @inject(IdentityTokens.UserRepository)
    private readonly userRepo: IUserRepository,

    @inject(CustomerTokens.CustomerRepository)
    private readonly customerRepo: ICustomerRepository,

    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,
  ) {}

  async execute(input: GetCustomerProfileInput): Promise<GetCustomerProfileResult> {
    const userId = input.userId;

    this.logger.info('Executing GetCustomerProfileUseCase', { userId });

    const user = await this.userRepo.findById(userId);

    if (!user) {
      this.logger.warn('User not found during get profile', { userId });
      throw new AuthenticationError('User not found');
    }

    const customer = await this.customerRepo.findByUserId(userId);

    if (!customer) {
      this.logger.warn('Customer not found during get profile', { userId });
      throw new CustomerNotFoundError();
    }

    this.logger.info('Customer profile retrieved successfully', { customerId: customer.getId() });

    return {
      customerId: customer.getId(),
      userId: customer.getUserId(),
      firstName: customer.getFirstName().getValue(),
      lastName: customer.getLastName().getValue(),
      phone: customer.getPhone().getValue(),
      avatarUrl: customer.getAvatarUrl()?.getValue() ?? null,
      preferences: customer.getPreferences().toPrimitives(),
      createdAt: customer.getCreatedAt(),
      updatedAt: customer.getUpdatedAt(),
    };
  }
}
