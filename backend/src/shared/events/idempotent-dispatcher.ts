import { PrismaClient } from '../../generated/prisma/client.js';
import { DomainEvent } from './domain-event.js';
import { EventHandler } from './event-dispatcher.js';

const STALE_CLAIM_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export class IdempotentDispatcher {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly eventId: string,
  ) {}

  public async dispatchWithIdempotency(
    event: DomainEvent,
    handlers: EventHandler[],
  ): Promise<void> {
    const promises = handlers.map((handler) => this.runHandlerIdempotently(event, handler));
    await Promise.all(promises);
  }

  private async runHandlerIdempotently(event: DomainEvent, handler: EventHandler): Promise<void> {
    const handlerName = handler.constructor.name;
    const now = new Date();
    const staleThreshold = new Date(now.getTime() - STALE_CLAIM_TIMEOUT_MS);

    // 1. Try to claim the execution
    const claimResult = await this.prisma.$executeRaw`
      INSERT INTO event_handler_executions ("eventId", handler_name, status, attempt_count, claimed_at)
      VALUES (${this.eventId}::uuid, ${handlerName}, 'PROCESSING', 1, ${now})
      ON CONFLICT ("eventId", handler_name) DO UPDATE SET
        status = 'PROCESSING',
        attempt_count = event_handler_executions.attempt_count + 1,
        claimed_at = ${now}
      WHERE event_handler_executions.status = 'PROCESSING'
        AND event_handler_executions.claimed_at < ${staleThreshold}
    `;

    if (claimResult === 0) {
      // We couldn't claim it. It's either SUCCEEDED already, or someone else has a fresh PROCESSING claim.
      return;
    }

    // 2. Run the handler
    try {
      await handler.handle(event);

      // 3. Mark as SUCCEEDED
      await this.prisma.eventHandlerExecution.update({
        where: {
          eventId_handlerName: {
            eventId: this.eventId,
            handlerName: handlerName,
          },
        },
        data: {
          status: 'SUCCEEDED',
          completedAt: new Date(),
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // 4. Record the error, but leave status as PROCESSING (and clear claimed_at so it can be retried if needed, or leave it to expire)
      // Actually leaving it to expire is fine, or we can clear claimed_at to allow immediate retry if the outer outbox mechanism retries.
      // But the outer outbox will retry the whole event based on its own backoff. So we'll just clear claimed_at.
      await this.prisma.eventHandlerExecution.update({
        where: {
          eventId_handlerName: {
            eventId: this.eventId,
            handlerName: handlerName,
          },
        },
        data: {
          lastError: errorMessage,
          claimedAt: null, // allow immediate reclaim on next outbox retry
        },
      });

      throw error; // Re-throw so outbox worker knows this handler failed
    }
  }
}
