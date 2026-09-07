import { injectable, inject } from 'tsyringe';
import { CustomerProfileCreationUseCase } from './customer-profile-creation.use-case.js';
import { CustomerProfileInput } from '../dto/customer-profile-creation.dto.js';
import { Customer } from '../../domain/entities/customer.entity.js';
import { CustomerFirstName } from '../../domain/value-objects/customer-first-name.vo.js';
import { CustomerLastName } from '../../domain/value-objects/customer-last-name.vo.js';
import { CustomerPhoneNumber } from '../../domain/value-objects/customer-phone.vo.js';
import { CustomerAvatarUrl } from '../../domain/value-objects/customer-avatar.vo.js';
import { CustomerPreferences } from '../../domain/value-objects/customer-preferences.vo.js';
import { InfrastructureTokens } from '../../../../infrastructure/container/index.js';
import type { ILogger } from '../../../../shared/logger/logger.interface.js';

@injectable()
export class CustomerProfileCreationUseCaseImpl implements CustomerProfileCreationUseCase {
  constructor(
    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,
  ) {}

  async execute(input: CustomerProfileInput): Promise<Customer> {
    const userId = input.userId;

    this.logger.info('Executing CustomerProfileCreationUseCase', { userId });
    this.logger.debug('Customer profile creation input', { input });

    const now = new Date();

    const customerEntity = Customer.create({
      userId: input.userId,
      firstName: CustomerFirstName.create(input.firstName),
      lastName: CustomerLastName.create(input.lastName),
      phone: CustomerPhoneNumber.create(input.phone),
      avatarUrl: CustomerAvatarUrl.create(input.avatarUrl ?? null),
      preferences: CustomerPreferences.default(),
      createdAt: now,
      updatedAt: now,
    });

    this.logger.debug('Customer entity created successfully in memory', {
      customerId: customerEntity.getId(),
    });

    return customerEntity;
  }
}
