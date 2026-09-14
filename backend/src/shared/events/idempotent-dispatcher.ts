import { PrismaClient } from '../../generated/prisma/client.js';
import { DomainEvent } from './domain-event.js';
import { EventHandler } from './event-dispatcher.js';
import crypto from 'crypto';

const STALE_CLAIM_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const HEARTBEAT_INTERVAL_MS = 30 * 1000; // 30 seconds

export type HandlerExecutionResult =
  | { status: 'SUCCEEDED' }
  | { status: 'ALREADY_SUCCEEDED' }
  | { status: 'IN_PROGRESS' }
  | { status: 'FAILED' };

export class IdempotentDispatcher {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly eventId: string,
  ) {}

  public async dispatchWithIdempotency(
    event: DomainEvent,
    handlers: EventHandler[],
  ): Promise<HandlerExecutionResult[]> {
    const promises = handlers.map((handler) => this.runHandlerIdempotently(event, handler));
    return Promise.all(promises);
  }

  private async runHandlerIdempotently(
    event: DomainEvent,
    handler: EventHandler,
  ): Promise<HandlerExecutionResult> {
    const handlerName = handler.constructor.name;
    const now = new Date();
    const staleThreshold = new Date(now.getTime() - STALE_CLAIM_TIMEOUT_MS);
    const leaseToken = crypto.randomUUID();
    let leaseLost = false;

    // 1. Try to claim the execution
    const claimResult = await this.prisma.$executeRaw`
      INSERT INTO event_handler_executions ("eventId", handler_name, status, attempt_count, claimed_at, lease_token)
      VALUES (${this.eventId}::uuid, ${handlerName}, 'PROCESSING', 1, ${now}, ${leaseToken})
      ON CONFLICT ("eventId", handler_name) DO UPDATE SET
        status = 'PROCESSING',
        attempt_count = event_handler_executions.attempt_count + 1,
        claimed_at = ${now},
        lease_token = ${leaseToken}
      WHERE event_handler_executions.status = 'PROCESSING'
        AND (
          event_handler_executions.claimed_at IS NULL
          OR event_handler_executions.claimed_at < ${staleThreshold}
        )
    `;

    if (claimResult === 0) {
      // We couldn't claim it. Check if it's already SUCCEEDED.
      const existing = await this.prisma.eventHandlerExecution.findUnique({
        where: {
          eventId_handlerName: {
            eventId: this.eventId,
            handlerName: handlerName,
          },
        },
      });

      if (existing?.status === 'SUCCEEDED') {
        return { status: 'ALREADY_SUCCEEDED' };
      } else {
        return { status: 'IN_PROGRESS' };
      }
    }

    // Start heartbeat
    const heartbeat = setInterval(async () => {
      if (leaseLost) return;
      try {
        const result = await this.prisma.$executeRaw`
          UPDATE event_handler_executions
          SET claimed_at = NOW()
          WHERE "eventId" = ${this.eventId}::uuid
            AND handler_name = ${handlerName}
            AND status = 'PROCESSING'
            AND lease_token = ${leaseToken}
        `;

        if (result === 0) {
          leaseLost = true;
        }
      } catch (err) {
        console.error('Failed to heartbeat idempotent execution', err);
      }
    }, HEARTBEAT_INTERVAL_MS);

    // 2. Run the handler
    try {
      await handler.handle(event);

      if (leaseLost) {
        return { status: 'FAILED' };
      }

      // 3. Mark as SUCCEEDED
      const completeResult = await this.prisma.$executeRaw`
        UPDATE event_handler_executions
        SET status = 'SUCCEEDED', completed_at = NOW(), lease_token = NULL
        WHERE "eventId" = ${this.eventId}::uuid
          AND handler_name = ${handlerName}
          AND status = 'PROCESSING'
          AND lease_token = ${leaseToken}
      `;

      if (completeResult === 0) {
        return { status: 'FAILED' };
      }

      return { status: 'SUCCEEDED' };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (!leaseLost) {
        await this.prisma.$executeRaw`
          UPDATE event_handler_executions
          SET last_error = ${errorMessage}, claimed_at = NULL, lease_token = NULL
          WHERE "eventId" = ${this.eventId}::uuid
            AND handler_name = ${handlerName}
            AND status = 'PROCESSING'
            AND lease_token = ${leaseToken}
        `;
      }

      return { status: 'FAILED' };
    } finally {
      clearInterval(heartbeat);
    }
  }
}
