import { DomainEvent } from '../../../../shared/events/domain-event.js';

export class DeliveryPickedUpEvent implements DomainEvent {
  public readonly eventName = 'DeliveryPickedUpEvent';
  public readonly occurredOn: Date;

  constructor(
    public readonly assignmentId: string,
    public readonly orderId: string,
    public readonly driverId: string,
  ) {
    this.occurredOn = new Date();
  }
}
