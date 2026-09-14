import { injectable, inject } from 'tsyringe';
import { BaseRepository } from '../../database/base.repository.js';
import { InfrastructureTokens } from '../../container/tokens/index.js';
import type { PrismaExecutor } from '../../database/prisma-client.type.js';
import { OutboxEvent } from '../../../generated/prisma/client.js';

export interface IOutboxEventRepository {
  claimBatch(limit: number, claimTimeoutMs: number): Promise<OutboxEvent[]>;
  markProcessed(eventId: string): Promise<void>;
  scheduleRetry(eventId: string, nextAttemptAt: Date, error: string): Promise<void>;
  markDeadLettered(eventId: string, error: string): Promise<void>;
  releaseClaim(eventId: string, nextAttemptAt?: Date): Promise<void>;
}

@injectable()
export class PrismaOutboxEventRepository extends BaseRepository implements IOutboxEventRepository {
  constructor(
    @inject(InfrastructureTokens.PrismaClient)
    prisma: PrismaExecutor,
  ) {
    super(prisma);
  }

  async claimBatch(limit: number, claimTimeoutMs: number): Promise<OutboxEvent[]> {
    const claimTimeoutDate = new Date(Date.now() - claimTimeoutMs);
    const now = new Date();

    return await this.execute(async () => {
      // Use raw query for FOR UPDATE SKIP LOCKED
      // Find events that are:
      // 1. Not processed (processed_at IS NULL)
      // 2. Not dead-lettered (dead_lettered_at IS NULL)
      // 3. Either never claimed OR claimed longer than the timeout ago
      // 4. Either no next_attempt_at OR next_attempt_at <= now
      const events = await this.prisma.$queryRaw<OutboxEvent[]>`
        WITH available_events AS (
          SELECT id
          FROM outbox_events
          WHERE processed_at IS NULL
            AND dead_lettered_at IS NULL
            AND (claimed_at IS NULL OR claimed_at < ${claimTimeoutDate})
            AND (next_attempt_at IS NULL OR next_attempt_at <= ${now})
          ORDER BY created_at ASC
          LIMIT ${limit}
          FOR UPDATE SKIP LOCKED
        )
        UPDATE outbox_events
        SET 
          claimed_at = ${now},
          attempt_count = attempt_count + 1,
          last_attempt_at = ${now}
        FROM available_events
        WHERE outbox_events.id = available_events.id
        RETURNING outbox_events.*;
      `;
      return events;
    });
  }

  async markProcessed(eventId: string): Promise<void> {
    await this.execute(() =>
      this.prisma.outboxEvent.update({
        where: { id: eventId },
        data: {
          processedAt: new Date(),
          claimedAt: null,
          lastError: null,
          nextAttemptAt: null,
        },
      }),
    );
  }

  async scheduleRetry(eventId: string, nextAttemptAt: Date, error: string): Promise<void> {
    await this.execute(() =>
      this.prisma.outboxEvent.update({
        where: { id: eventId },
        data: {
          nextAttemptAt,
          lastError: error,
          claimedAt: null,
        },
      }),
    );
  }

  async markDeadLettered(eventId: string, error: string): Promise<void> {
    await this.execute(() =>
      this.prisma.outboxEvent.update({
        where: { id: eventId },
        data: {
          deadLetteredAt: new Date(),
          lastError: error,
          claimedAt: null,
        },
      }),
    );
  }

  async releaseClaim(eventId: string, nextAttemptAt?: Date): Promise<void> {
    await this.execute(() =>
      this.prisma.outboxEvent.update({
        where: { id: eventId },
        data: {
          claimedAt: null,
          ...(nextAttemptAt ? { nextAttemptAt } : {}),
        },
      }),
    );
  }
}
