import { DomainEvent } from '../../../../shared/events/domain-event.js';

export class OrderPaidEvent implements DomainEvent {
  public readonly eventName = 'OrderPaidEvent';
  public readonly occurredOn: Date;

  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly restaurantId: string,
  ) {
    this.occurredOn = new Date();
  }
}
