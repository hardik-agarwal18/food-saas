import { EventDispatcher } from '../../../shared/events/event-dispatcher.js';
import { ILogger } from '../../../shared/logger/logger.interface.js';
import { IOutboxEventRepository } from '../repositories/outbox.repository.js';

// Domain Events
import { OrderReadyEvent } from '../../../modules/ordering/domain/events/order-ready.event.js';
import { DeliveryPickedUpEvent } from '../../../modules/delivery/domain/events/delivery-picked-up.event.js';
import { DeliveryDeliveredEvent } from '../../../modules/delivery/domain/events/delivery-delivered.event.js';
import { OrderPlacedEvent } from '../../../modules/ordering/domain/events/order-placed.event.js';
import { DomainEvent } from '../../../shared/events/domain-event.js';

/**
 * Reconstructs a DomainEvent instance from its JSON payload.
 */
function deserializeEvent(eventName: string, payload: any): DomainEvent | null {
  switch (eventName) {
    case 'OrderReadyEvent':
      return new OrderReadyEvent(
        payload.orderId,
        payload.restaurantId,
        payload.orderType,
        payload.deliveryFee,
      );
    case 'OrderPlacedEvent':
      return new OrderPlacedEvent(
        payload.orderId,
        payload.restaurantId,
        payload.orderType,
        payload.deliveryFeeAmount,
      );
    case 'DeliveryPickedUpEvent':
      return new DeliveryPickedUpEvent(
        payload.deliveryAssignmentId,
        payload.orderId,
        payload.driverId,
      );
    case 'DeliveryDeliveredEvent':
      return new DeliveryDeliveredEvent(
        payload.deliveryAssignmentId,
        payload.orderId,
        payload.driverId,
      );
    default:
      return null;
  }
}

export interface OutboxWorkerConfig {
  pollIntervalMs: number;
  batchSize: number;
  claimTimeoutMs: number;
  maxAttempts: number;
  baseRetryDelayMs: number;
  maxRetryDelayMs: number;
}

/**
 * Starts the Outbox Worker to process pending domain events.
 */
export function startOutboxWorker(
  repository: IOutboxEventRepository,
  logger: ILogger,
  config: Partial<OutboxWorkerConfig> = {},
) {
  logger.info('Outbox Worker started', { component: 'OutboxWorker' });

  const workerConfig: OutboxWorkerConfig = {
    pollIntervalMs: config.pollIntervalMs || 5000,
    batchSize: config.batchSize || 50,
    claimTimeoutMs: config.claimTimeoutMs || 60000,
    maxAttempts: config.maxAttempts || 10,
    baseRetryDelayMs: config.baseRetryDelayMs || 1000,
    maxRetryDelayMs: config.maxRetryDelayMs || 300000,
  };

  let isRunning = true;
  let pollTimeout: NodeJS.Timeout | null = null;
  let isPolling = false;

  const calculateRetryDelay = (attemptCount: number): number => {
    const delay = Math.min(
      workerConfig.baseRetryDelayMs * Math.pow(2, Math.max(0, attemptCount - 1)),
      workerConfig.maxRetryDelayMs,
    );
    const jitter = Math.random() * 500;
    return delay + jitter;
  };

  const processBatch = async () => {
    isPolling = true;
    try {
      const pendingEvents = await repository.claimBatch(
        workerConfig.batchSize,
        workerConfig.claimTimeoutMs,
      );

      if (pendingEvents.length === 0) {
        return; // No events to process
      }

      const dispatcher = EventDispatcher.getInstance();

      for (const record of pendingEvents) {
        if (!isRunning) {
          // If shutting down, release the claim so another worker can pick it up
          await repository.releaseClaim(record.id);
          continue;
        }

        logger.info(`Claimed outbox event ${record.id}`, {
          component: 'OutboxWorker',
          eventId: record.id,
          eventType: record.eventName,
          attemptCount: record.attemptCount,
        });

        try {
          const event = deserializeEvent(record.eventName, record.payload);

          if (!event) {
            throw new Error(`Unknown event type: ${record.eventName}`);
          }

          const startMs = Date.now();
          await dispatcher.dispatch(event);
          const durationMs = Date.now() - startMs;

          await repository.markProcessed(record.id);

          logger.info(`Processed outbox event ${record.id}`, {
            component: 'OutboxWorker',
            eventId: record.id,
            eventType: record.eventName,
            durationMs,
          });
        } catch (error: any) {
          const errorMessage = error.message || 'Unknown error';

          logger.error(`Failed to process outbox event ${record.id}`, error, {
            component: 'OutboxWorker',
            eventId: record.id,
            eventType: record.eventName,
            attemptCount: record.attemptCount,
          });

          if (record.attemptCount >= workerConfig.maxAttempts) {
            await repository.markDeadLettered(record.id, errorMessage);
            logger.warn(`Dead-lettered outbox event ${record.id}`, {
              component: 'OutboxWorker',
              eventId: record.id,
              eventType: record.eventName,
              attemptCount: record.attemptCount,
              error: errorMessage,
            });
          } else {
            const delayMs = calculateRetryDelay(record.attemptCount);
            const nextAttemptAt = new Date(Date.now() + delayMs);
            await repository.scheduleRetry(record.id, nextAttemptAt, errorMessage);

            logger.info(`Scheduled retry for outbox event ${record.id}`, {
              component: 'OutboxWorker',
              eventId: record.id,
              eventType: record.eventName,
              attemptCount: record.attemptCount,
              nextAttemptAt,
              error: errorMessage,
            });
          }
        }
      }
    } catch (error) {
      logger.error('Outbox polling error', error, { component: 'OutboxWorker' });
    } finally {
      isPolling = false;
    }
  };

  const pollLoop = async () => {
    if (!isRunning) return;

    await processBatch();

    if (isRunning) {
      pollTimeout = setTimeout(pollLoop, workerConfig.pollIntervalMs);
    }
  };

  // Start the first poll immediately
  setImmediate(pollLoop);

  return {
    stopOutboxWorker: async () => {
      isRunning = false;
      if (pollTimeout) {
        clearTimeout(pollTimeout);
      }

      // Wait for current polling cycle to finish gracefully
      while (isPolling) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    },
  };
}
