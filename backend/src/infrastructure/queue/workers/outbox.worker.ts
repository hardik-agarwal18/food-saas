import { PrismaClient } from '../../../generated/prisma/client.js';
import { EventDispatcher } from '../../../shared/events/event-dispatcher.js';
import { ILogger } from '../../../shared/logger/logger.interface.js';

// Domain Events
import { OrderReadyEvent } from '../../../modules/ordering/domain/events/order-ready.event.js';
import { DeliveryPickedUpEvent } from '../../../modules/delivery/domain/events/delivery-picked-up.event.js';
import { DeliveryDeliveredEvent } from '../../../modules/delivery/domain/events/delivery-delivered.event.js';
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

/**
 * Starts the Outbox Worker to process pending domain events.
 */
export function startOutboxWorker(prisma: PrismaClient, logger: ILogger) {
  logger.info('Outbox Worker started', { component: 'OutboxWorker' });

  const pollOutbox = async () => {
    try {
      const pendingEvents = await prisma.outboxEvent.findMany({
        where: { processedAt: null },
        orderBy: { createdAt: 'asc' },
        take: 50,
      });

      if (pendingEvents.length === 0) return;

      const dispatcher = EventDispatcher.getInstance();

      for (const record of pendingEvents) {
        try {
          const event = deserializeEvent(record.eventName, record.payload);

          if (!event) {
            throw new Error(`Unknown event type: ${record.eventName}`);
          }

          // Dispatch the event synchronously to guarantee ordering
          await dispatcher.dispatch(event);

          // Mark as processed
          await prisma.outboxEvent.update({
            where: { id: record.id },
            data: { processedAt: new Date() },
          });

          logger.info(`Processed outbox event ${record.id}`, {
            component: 'OutboxWorker',
            eventName: record.eventName,
          });
        } catch (error: any) {
          logger.error(`Failed to process outbox event ${record.id}`, error, {
            component: 'OutboxWorker',
          });

          // Mark as failed
          await prisma.outboxEvent.update({
            where: { id: record.id },
            data: { error: error.message || 'Unknown error' },
          });
        }
      }
    } catch (error) {
      logger.error('Outbox polling error', error, { component: 'OutboxWorker' });
    }
  };

  const intervalId = setInterval(pollOutbox, 5000);

  return {
    stopOutboxWorker: () => clearInterval(intervalId),
  };
}
