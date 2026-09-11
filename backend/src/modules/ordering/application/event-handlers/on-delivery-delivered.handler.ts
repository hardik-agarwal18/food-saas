import { EventHandler } from '../../../../shared/events/event-dispatcher.js';
import { DeliveryDeliveredEvent } from '../../../delivery/domain/events/delivery-delivered.event.js';
import type { IOrderRepository } from '../../../ordering/domain/repositories/order.repository.js';
import { inject, injectable } from 'tsyringe';
import { OrderingTokens } from '../../infrastructure/tokens/ordering.tokens.js';

@injectable()
export class OnDeliveryDeliveredHandler implements EventHandler<DeliveryDeliveredEvent> {
  constructor(
    @inject(OrderingTokens.OrderRepository)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async handle(event: DeliveryDeliveredEvent): Promise<void> {
    const order = await this.orderRepository.findById(event.orderId);
    if (order) {
      order.markDelivered();
      await this.orderRepository.update(order);
    }
  }
}
