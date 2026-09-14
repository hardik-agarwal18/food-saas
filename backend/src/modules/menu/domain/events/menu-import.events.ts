import type { DomainEvent } from '../../../../shared/events/domain-event.js';

export class MenuImportCreatedEvent implements DomainEvent {
  public readonly eventName = 'MenuImportCreated';
  public readonly occurredOn: Date;

  constructor(
    public readonly importId: string,
    public readonly restaurantId: string,
    public readonly sourceFileKey: string,
  ) {
    this.occurredOn = new Date();
  }
}

export class MenuImportProcessingStartedEvent implements DomainEvent {
  public readonly eventName = 'MenuImportProcessingStarted';
  public readonly occurredOn: Date;

  constructor(
    public readonly importId: string,
    public readonly restaurantId: string,
  ) {
    this.occurredOn = new Date();
  }
}

export class MenuImportReadyForReviewEvent implements DomainEvent {
  public readonly eventName = 'MenuImportReadyForReview';
  public readonly occurredOn: Date;

  constructor(
    public readonly importId: string,
    public readonly restaurantId: string,
  ) {
    this.occurredOn = new Date();
  }
}

export class MenuImportFailedEvent implements DomainEvent {
  public readonly eventName = 'MenuImportFailed';
  public readonly occurredOn: Date;

  constructor(
    public readonly importId: string,
    public readonly restaurantId: string,
    public readonly reason: string,
  ) {
    this.occurredOn = new Date();
  }
}

export class MenuImportConfirmedEvent implements DomainEvent {
  public readonly eventName = 'MenuImportConfirmed';
  public readonly occurredOn: Date;

  constructor(
    public readonly importId: string,
    public readonly restaurantId: string,
  ) {
    this.occurredOn = new Date();
  }
}

export class MenuImportedEvent implements DomainEvent {
  public readonly eventName = 'MenuImported';
  public readonly occurredOn: Date;

  constructor(
    public readonly importId: string,
    public readonly restaurantId: string,
  ) {
    this.occurredOn = new Date();
  }
}
