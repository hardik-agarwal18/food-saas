import { injectable, inject } from 'tsyringe';
import { CustomerProfileUpdateResult } from '../dto/customer-profile-update-result.dto.js';
import { CustomerProfileUpdateInput } from '../dto/customer-profile-update.dto.js';
import { CustomerProfileUpdateUseCase } from './customer-profile-update.use-case.js';
import { CustomerTokens } from '../../infrastructure/persistence/tokens/customer.tokens.js';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.js';
import { IdentityTokens } from '../../../identity/infrastructure/persistence/tokens/identity.tokens.js';
import type { IUserRepository } from '../../../identity/domain/repositories/user.repository.js';
import { AuthenticationError } from '../../../../shared/errors/AuthenticationError.js';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error.js';
import { CustomerFirstName } from '../../domain/value-objects/customer-first-name.vo.js';
import { CustomerLastName } from '../../domain/value-objects/customer-last-name.vo.js';
import { CustomerPhoneNumber } from '../../domain/value-objects/customer-phone.vo.js';
import { InfrastructureTokens } from '../../../../infrastructure/container/index.js';
import type { ILogger } from '../../../../shared/logger/logger.interface.js';

@injectable()
export class CustomerProfileUpdateUseCaseImpl implements CustomerProfileUpdateUseCase {
  constructor(
    @inject(CustomerTokens.CustomerRepository)
    private readonly customerRepo: ICustomerRepository,

    @inject(IdentityTokens.UserRepository)
    private readonly userRepo: IUserRepository,

    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,
  ) {}

  async execute(input: CustomerProfileUpdateInput): Promise<CustomerProfileUpdateResult> {
    const userId = input.userId;

    this.logger.info('Executing CustomerProfileUpdateUseCase', { userId });

    const user = await this.userRepo.findById(userId);

    if (!user) {
      this.logger.warn('User not found during profile update', { userId });
      throw new AuthenticationError('User not found');
    }

    const customer = await this.customerRepo.findByUserId(userId);

    if (!customer) {
      this.logger.warn('Customer not found during profile update', { userId });
      throw new CustomerNotFoundError();
    }

    if (input.firstName) {
      customer.updateCustomerProfile({
        firstName: CustomerFirstName.create(input.firstName),
      });
    }

    if (input.lastName) {
      customer.updateCustomerProfile({
        lastName: CustomerLastName.create(input.lastName),
      });
    }

    if (input.phone) {
      customer.updateCustomerProfile({
        phone: CustomerPhoneNumber.create(input.phone),
      });
    }

    const updatedCustomerProfile = await this.customerRepo.update(customer);

    this.logger.info('Customer profile updated successfully', {
      customerId: updatedCustomerProfile.getId(),
    });

    return {
      customerId: updatedCustomerProfile.getId(),
      userId: updatedCustomerProfile.getUserId(),
      firstName: updatedCustomerProfile.getFirstName().getValue(),
      lastName: updatedCustomerProfile.getLastName().getValue(),
      phone: updatedCustomerProfile.getPhone().getValue(),
      avatarUrl: updatedCustomerProfile.getAvatarUrl()?.getValue() ?? null,
      preferences: updatedCustomerProfile.getPreferences().toPrimitives(),
      createdAt: updatedCustomerProfile.getCreatedAt(),
      updatedAt: updatedCustomerProfile.getUpdatedAt(),
    };
  }
}
