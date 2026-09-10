import { injectable, inject } from 'tsyringe';
import { EventHandler } from '../../../../shared/events/event-dispatcher.js';
import { DeliveryPickedUpEvent } from '../../../delivery/domain/events/delivery-picked-up.event.js';
import type { EmailService } from '../../../../infrastructure/email/email.service.js';
import type { PushNotificationService } from '../../../../infrastructure/notifications/push-notification.service.js';
import type { IOrderRepository } from '../../../ordering/domain/repositories/order.repository.js';
import type { ICustomerRepository } from '../../../customer/domain/repositories/customer.repository.js';
import type { IUserRepository } from '../../../identity/domain/repositories/user.repository.js';
import type { IDriverRepository } from '../../../delivery/domain/repositories/driver.repository.js';
import { OrderingTokens } from '../../../ordering/infrastructure/tokens/ordering.tokens.js';
import { CustomerTokens } from '../../../customer/infrastructure/persistence/tokens/customer.tokens.js';
import { IdentityTokens } from '../../../identity/infrastructure/persistence/tokens/index.js';
import { DeliveryTokens } from '../../../delivery/infrastructure/tokens/delivery.tokens.js';
import { InfrastructureTokens } from '../../../../infrastructure/container/tokens/infrastructure.tokens.js';
import type { ILogger } from '../../../../shared/logger/logger.interface.js';

@injectable()
export class DeliveryPickedUpHandler implements EventHandler<DeliveryPickedUpEvent> {
  private readonly logger: ILogger;

  constructor(
    @inject(OrderingTokens.OrderRepository)
    private readonly orderRepo: IOrderRepository,
    @inject(CustomerTokens.CustomerRepository)
    private readonly customerRepo: ICustomerRepository,
    @inject(IdentityTokens.UserRepository)
    private readonly userRepo: IUserRepository,
    @inject(DeliveryTokens.DriverRepository)
    private readonly driverRepo: IDriverRepository,
    @inject(InfrastructureTokens.EmailService)
    private readonly emailService: EmailService,
    @inject('PushNotificationService')
    private readonly pushService: PushNotificationService,
    @inject(InfrastructureTokens.Logger)
    logger: ILogger,
  ) {
    this.logger = logger.child({ component: 'DeliveryPickedUpHandler' });
  }

  async handle(event: DeliveryPickedUpEvent): Promise<void> {
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

      const driver = await this.driverRepo.findById(event.driverId);
      if (!driver) {
        this.logger.error(`Driver not found for event`, undefined, { driverId: event.driverId });
        return;
      }
      const driverName = driver.firstName;

      const email = user.getEmail().getValue();

      // Dispatch Email
      await this.emailService.sendOrderPickedUpEmail(email, order.getId(), driverName);

      // Dispatch Push Notification
      await this.pushService.sendPushNotification(
        user.getId(),
        'Order is on the way!',
        `Your driver, ${driverName}, has picked up your order and is heading your way!`,
      );

      this.logger.info(`Successfully processed DeliveryPickedUpEvent`, { orderId: order.getId() });
    } catch (error) {
      this.logger.error(`Failed to process DeliveryPickedUpEvent`, error, { event });
      throw error;
    }
  }
}
