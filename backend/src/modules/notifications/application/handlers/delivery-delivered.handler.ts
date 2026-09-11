import { injectable, inject } from 'tsyringe';
import { EventHandler } from '../../../../shared/events/event-dispatcher.js';
import { DeliveryDeliveredEvent } from '../../../delivery/domain/events/delivery-delivered.event.js';
import type { EmailService } from '../../../../infrastructure/email/email.service.js';
import type { PushNotificationService } from '../../../../infrastructure/notifications/push-notification.service.js';
import type { IOrderRepository } from '../../../ordering/domain/repositories/order.repository.js';
import type { ICustomerRepository } from '../../../customer/domain/repositories/customer.repository.js';
import type { IUserRepository } from '../../../identity/domain/repositories/user.repository.js';
import { OrderingTokens } from '../../../ordering/infrastructure/tokens/ordering.tokens.js';
import { CustomerTokens } from '../../../customer/infrastructure/persistence/tokens/customer.tokens.js';
import { IdentityTokens } from '../../../identity/infrastructure/persistence/tokens/index.js';
import { InfrastructureTokens } from '../../../../infrastructure/container/tokens/infrastructure.tokens.js';
import type { ILogger } from '../../../../shared/logger/logger.interface.js';

@injectable()
export class DeliveryDeliveredHandler implements EventHandler<DeliveryDeliveredEvent> {
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
    this.logger = logger.child({ component: 'DeliveryDeliveredHandler' });
  }

  async handle(event: DeliveryDeliveredEvent): Promise<void> {
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

      // Dispatch Email
      await this.emailService.sendOrderDeliveredEmail(email, order.getId());

      // Dispatch Push Notification
      await this.pushService.sendPushNotification(
        user.getId(),
        'Order Delivered!',
        `Your order has been successfully delivered. Enjoy your meal!`,
      );

      this.logger.info(`Successfully processed DeliveryDeliveredEvent`, { orderId: order.getId() });
    } catch (error) {
      this.logger.error(`Failed to process DeliveryDeliveredEvent`, error, { event });
      throw error;
    }
  }
}
