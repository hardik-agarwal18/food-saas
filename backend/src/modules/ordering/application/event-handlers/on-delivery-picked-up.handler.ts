import { EventHandler } from '../../../../shared/events/event-dispatcher.js';
import { DeliveryPickedUpEvent } from '../../../delivery/domain/events/delivery-picked-up.event.js';
import type { IOrderRepository } from '../../../ordering/domain/repositories/order.repository.js';
import { inject, injectable } from 'tsyringe';
import { OrderingTokens } from '../../infrastructure/tokens/ordering.tokens.js';

@injectable()
export class OnDeliveryPickedUpHandler implements EventHandler<DeliveryPickedUpEvent> {
  constructor(
    @inject(OrderingTokens.OrderRepository)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async handle(event: DeliveryPickedUpEvent): Promise<void> {
    const order = await this.orderRepository.findById(event.orderId);
    if (order) {
      order.markOutForDelivery();
      await this.orderRepository.update(order);
    }
  }
}
