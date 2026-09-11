import { DomainEvent } from '../events/domain-event.js';

/**
 * Base class for all Aggregate Roots.
 * Provides the ability to store Domain Events that occurred within the aggregate.
 * These events should be persisted within the same database transaction as the aggregate state changes (Outbox Pattern).
 */
export abstract class AggregateRoot {
  private domainEvents: DomainEvent[] = [];

  /**
   * Add a domain event to the aggregate.
   */
  protected addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  /**
   * Clear all domain events from the aggregate.
   * This should be called *after* the events have been successfully persisted to the database.
   */
  public clearDomainEvents(): void {
    this.domainEvents = [];
  }

  /**
   * Retrieve a copy of the current domain events.
   */
  public getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }
}
