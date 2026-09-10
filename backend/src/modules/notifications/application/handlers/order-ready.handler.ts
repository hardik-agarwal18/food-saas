import { injectable, inject } from 'tsyringe';
import { EventHandler } from '../../../../shared/events/event-dispatcher.js';
import { OrderReadyEvent } from '../../../ordering/domain/events/order-ready.event.js';
import type { EmailService } from '../../../../infrastructure/email/email.service.js';
import type { PushNotificationService } from '../../../../infrastructure/notifications/push-notification.service.js';
import type { IOrderRepository } from '../../../ordering/domain/repositories/order.repository.js';
import type { IUserRepository } from '../../../identity/domain/repositories/user.repository.js';
import type { ICustomerRepository } from '../../../customer/domain/repositories/customer.repository.js';
import { OrderingTokens } from '../../../ordering/infrastructure/tokens/ordering.tokens.js';
import { IdentityTokens } from '../../../identity/infrastructure/persistence/tokens/index.js';
import { CustomerTokens } from '../../../customer/infrastructure/persistence/tokens/customer.tokens.js';
import { InfrastructureTokens } from '../../../../infrastructure/container/tokens/infrastructure.tokens.js';
import type { ILogger } from '../../../../shared/logger/logger.interface.js';

@injectable()
export class OrderReadyHandler implements EventHandler<OrderReadyEvent> {
  private readonly logger: ILogger;

  constructor(
    @inject(OrderingTokens.OrderRepository)
    private readonly orderRepo: IOrderRepository,
    @inject(CustomerTokens.CustomerRepository)
    private readonly customerRepo: ICustomerRepository,
    @inject(IdentityTokens.UserRepository)
    private readonly userRepo: IUserRepository,
    @inject(InfrastructureTokens.EmailService)
    private readonly emailService: EmailService,
    @inject('PushNotificationService')
    private readonly pushService: PushNotificationService,
    @inject(InfrastructureTokens.Logger)
    logger: ILogger,
  ) {
    this.logger = logger.child({ component: 'OrderReadyHandler' });
  }

  async handle(event: OrderReadyEvent): Promise<void> {
    try {
      const order = await this.orderRepo.findById(event.orderId);
      if (!order) {
        this.logger.error(`Order not found for event`, undefined, { event });
        return;
      }

      const customer = await this.customerRepo.findById(order.getCustomerId());
      if (!customer) {
        this.logger.error(`Customer not found for order`, undefined, { orderId: order.getId() });
        return;
      }

      const user = await this.userRepo.findById(customer.getUserId());
      if (!user) {
        this.logger.error(`User not found for customer`, undefined, {
          customerId: customer.getId(),
        });
        return;
      }

      const email = user.getEmail().getValue();
      const restaurantName = order.getRestaurantName();

      // Dispatch Email
      await this.emailService.sendOrderReadyEmail(email, order.getId(), restaurantName);

      // Dispatch Push Notification
      await this.pushService.sendPushNotification(
        user.getId(),
        'Order Ready!',
        `Your order from ${restaurantName} is prepared and ready!`,
      );

      this.logger.info(`Successfully processed OrderReadyEvent`, { orderId: order.getId() });
    } catch (error) {
      this.logger.error(`Failed to process OrderReadyEvent`, error, { event });
      throw error; // Will be caught by the outbox worker and marked as failed for retry
    }
  }
}
