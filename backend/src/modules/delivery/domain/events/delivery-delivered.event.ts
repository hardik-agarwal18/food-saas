import { DomainEvent } from '../../../../shared/events/domain-event.js';

export class DeliveryDeliveredEvent implements DomainEvent {
  public readonly eventName = 'DeliveryDeliveredEvent';
  public readonly occurredOn: Date;

  constructor(
    public readonly assignmentId: string,
    public readonly orderId: string,
    public readonly driverId: string,
  ) {
    this.occurredOn = new Date();
  }
}
