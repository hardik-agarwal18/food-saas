import { DomainEvent } from '../../../../shared/events/domain-event.js';
import { OrderType } from '../../../../generated/prisma/client.js';

export class OrderPlacedEvent implements DomainEvent {
  public readonly eventName = 'OrderPlacedEvent';
  public readonly occurredOn: Date;

  constructor(
    public readonly orderId: string,
    public readonly restaurantId: string,
    public readonly orderType: OrderType,
    public readonly deliveryFeeAmount: number,
  ) {
    this.occurredOn = new Date();
  }
}
