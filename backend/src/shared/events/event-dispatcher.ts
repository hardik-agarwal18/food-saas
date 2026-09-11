import { DomainEvent } from './domain-event.js';

export interface EventHandler<T extends DomainEvent = DomainEvent> {
  handle(event: T): Promise<void> | void;
}

export class EventDispatcher {
  private static instance: EventDispatcher;
  private handlers: Map<string, EventHandler[]> = new Map();

  private constructor() {}

  public static getInstance(): EventDispatcher {
    if (!EventDispatcher.instance) {
      EventDispatcher.instance = new EventDispatcher();
    }
    return EventDispatcher.instance;
  }

  public register<T extends DomainEvent>(eventName: string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(eventName) ?? [];
    handlers.push(handler as EventHandler);
    this.handlers.set(eventName, handlers);
  }

  public async dispatch(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName);
    if (handlers) {
      // In a real production system, you'd want proper error isolation or an outbox here.
      // We will map all handlers and await them, allowing parallel execution.
      await Promise.all(handlers.map((h) => h.handle(event)));
    }
  }
}
