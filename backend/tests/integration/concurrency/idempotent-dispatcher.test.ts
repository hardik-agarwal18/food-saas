import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../../../src/infrastructure/database/prisma.js';
import { IdempotentDispatcher } from '../../../src/shared/events/idempotent-dispatcher.js';
import { DomainEvent } from '../../../src/shared/events/domain-event.js';
import { EventHandler } from '../../../src/shared/events/event-dispatcher.js';
import crypto from 'crypto';

class DummyEvent implements DomainEvent {
  public occurredOn: Date;
  constructor(public id: string = crypto.randomUUID(), public eventName = 'DummyEvent') {
    this.occurredOn = new Date();
  }
}

class SucceedingHandler implements EventHandler {
  public executionCount = 0;
  async handle(event: DomainEvent): Promise<void> {
    this.executionCount++;
    // Simulate some work
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

class FailingHandler implements EventHandler {
  public executionCount = 0;
  async handle(event: DomainEvent): Promise<void> {
    this.executionCount++;
    throw new Error('Handler intentionally failed');
  }
}

class SlowHandler implements EventHandler {
  async handle(event: DomainEvent): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

describe('IdempotentDispatcher', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should successfully execute a handler and return SUCCEEDED', async () => {
    const eventId = crypto.randomUUID();
    const dispatcher = new IdempotentDispatcher(prisma, eventId);
    const event = new DummyEvent(eventId);
    const handler = new SucceedingHandler();

    const results = await dispatcher.dispatchWithIdempotency(event, [handler]);

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('SUCCEEDED');
    expect(handler.executionCount).toBe(1);

    const record = await prisma.eventHandlerExecution.findUnique({
      where: {
        eventId_handlerName: {
          eventId,
          handlerName: 'SucceedingHandler',
        },
      },
    });

    expect(record?.status).toBe('SUCCEEDED');
  });

  it('should return ALREADY_SUCCEEDED if handler was already executed', async () => {
    const eventId = crypto.randomUUID();
    const dispatcher = new IdempotentDispatcher(prisma, eventId);
    const event = new DummyEvent(eventId);
    const handler = new SucceedingHandler();

    // First run
    await dispatcher.dispatchWithIdempotency(event, [handler]);

    // Second run
    const results = await dispatcher.dispatchWithIdempotency(event, [handler]);

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('ALREADY_SUCCEEDED');
    expect(handler.executionCount).toBe(1); // Not incremented again
  });

  it('should return FAILED and clear claimedAt if handler throws an error', async () => {
    const eventId = crypto.randomUUID();
    const dispatcher = new IdempotentDispatcher(prisma, eventId);
    const event = new DummyEvent(eventId);
    const handler = new FailingHandler();

    const results = await dispatcher.dispatchWithIdempotency(event, [handler]);

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('FAILED');
    expect(handler.executionCount).toBe(1);

    const record = await prisma.eventHandlerExecution.findUnique({
      where: {
        eventId_handlerName: {
          eventId,
          handlerName: 'FailingHandler',
        },
      },
    });

    expect(record?.status).toBe('PROCESSING'); // Status remains PROCESSING
    expect(record?.claimedAt).toBeNull(); // Claim is released for retry
    expect(record?.lastError).toBe('Handler intentionally failed');
  });

  it('should allow reclaiming and retrying if claimedAt is null', async () => {
    const eventId = crypto.randomUUID();
    const dispatcher = new IdempotentDispatcher(prisma, eventId);
    const event = new DummyEvent(eventId);
    
    // Run failing handler first
    const failingHandler = new FailingHandler();
    await dispatcher.dispatchWithIdempotency(event, [failingHandler]);

    // Now pretend outbox retries, and we use a succeeding handler
    const succeedingHandler = new SucceedingHandler();
    
    // We have to mock the class name so it matches the DB record for the test
    Object.defineProperty(succeedingHandler.constructor, 'name', { value: 'FailingHandler' });

    const results = await dispatcher.dispatchWithIdempotency(event, [succeedingHandler]);

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('SUCCEEDED');
    
    const record = await prisma.eventHandlerExecution.findUnique({
      where: {
        eventId_handlerName: {
          eventId,
          handlerName: 'FailingHandler',
        },
      },
    });

    expect(record?.status).toBe('SUCCEEDED');
    expect(record?.attemptCount).toBe(2);
  });

  it('should return IN_PROGRESS if another worker is currently executing it', async () => {
    const eventId = crypto.randomUUID();
    const dispatcher1 = new IdempotentDispatcher(prisma, eventId);
    const dispatcher2 = new IdempotentDispatcher(prisma, eventId);
    const event = new DummyEvent(eventId);
    
    const slowHandler = new SlowHandler();

    // Start first dispatcher, don't await yet
    const promise1 = dispatcher1.dispatchWithIdempotency(event, [slowHandler]);

    // Wait slightly to ensure it claims
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Try to dispatch with second worker
    const results2 = await dispatcher2.dispatchWithIdempotency(event, [slowHandler]);

    expect(results2).toHaveLength(1);
    expect(results2[0].status).toBe('IN_PROGRESS');

    // Finish first promise
    const results1 = await promise1;
    expect(results1[0].status).toBe('SUCCEEDED');
  });
});
