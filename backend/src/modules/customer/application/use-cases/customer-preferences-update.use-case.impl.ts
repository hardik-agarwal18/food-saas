import { injectable, inject } from 'tsyringe';
import { CustomerPreferencesUpdateUseCase } from './customer-preferences-update.use-case.js';
import { CustomerPreferenceUpdateInput } from '../dto/customer-preference-update.dto.js';
import { IdentityTokens } from '../../../identity/infrastructure/persistence/tokens/identity.tokens.js';
import type { IUserRepository } from '../../../identity/domain/repositories/user.repository.js';
import { AuthenticationError } from '../../../../shared/errors/AuthenticationError.js';
import { CustomerTokens } from '../../infrastructure/persistence/tokens/customer.tokens.js';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.js';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error.js';
import { InfrastructureTokens } from '../../../../infrastructure/container/index.js';
import type { ILogger } from '../../../../shared/logger/logger.interface.js';

@injectable()
export class CustomerPreferencesUpdateUseCaseImpl implements CustomerPreferencesUpdateUseCase {
  constructor(
    @inject(IdentityTokens.UserRepository)
    private readonly userRepo: IUserRepository,

    @inject(CustomerTokens.CustomerRepository)
    private readonly customerRepo: ICustomerRepository,

    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,
  ) {}

  async execute(input: CustomerPreferenceUpdateInput): Promise<void> {
    const userId = input.userId;

    this.logger.info('Executing CustomerPreferencesUpdateUseCase', { userId });
    this.logger.debug('Customer preferences update input', { input });

    const user = await this.userRepo.findById(userId);

    if (!user) {
      this.logger.warn('User not found during preferences update', { userId });
      throw new AuthenticationError('User not found');
    }

    const customer = await this.customerRepo.findByUserId(userId);

    if (!customer) {
      this.logger.warn('Customer not found during preferences update', { userId });
      throw new CustomerNotFoundError();
    }

    if (input.language !== undefined) {
      this.logger.debug('Updating language preference', { userId, language: input.language });
      customer.updateLanguagePreference(input.language);
    }

    if (input.notifications !== undefined) {
      const currentNotifications = customer.getPreferences().getNotifications();

      const notifications = {
        push: input.notifications.push ?? currentNotifications.push,
        sms: input.notifications.sms ?? currentNotifications.sms,
        email: input.notifications.email ?? currentNotifications.email,
      };

      this.logger.debug('Updating notification preferences', { userId, notifications });
      customer.updateNotificationPreference(notifications);
    }

    if (input.marketing !== undefined) {
      const marketing = {
        enabled: input.marketing.enabled ?? customer.getPreferences().getMarketing().enabled,
      };
      this.logger.debug('Updating marketing preferences', { userId, marketing });
      customer.updateMarketingPreference(marketing);
    }

    await this.customerRepo.update(customer);

    this.logger.info('Customer preferences updated successfully', { userId });
  }
}
