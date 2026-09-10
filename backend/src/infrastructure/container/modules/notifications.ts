import { container } from 'tsyringe';
import { EventDispatcher } from '../../../shared/events/event-dispatcher.js';

// Services
import { PushNotificationService } from '../../notifications/push-notification.service.js';
import { MockPushNotificationService } from '../../notifications/mock-push-notification.service.js';

// Handlers
import { OrderReadyHandler } from '../../../modules/notifications/application/handlers/order-ready.handler.js';
import { DeliveryPickedUpHandler } from '../../../modules/notifications/application/handlers/delivery-picked-up.handler.js';
import { DeliveryDeliveredHandler } from '../../../modules/notifications/application/handlers/delivery-delivered.handler.js';

export function registerNotificationsDependencies(): void {
  // Register push service
  container.registerSingleton<PushNotificationService>(
    'PushNotificationService',
    MockPushNotificationService,
  );

  // Register Handlers
  container.register(OrderReadyHandler, { useClass: OrderReadyHandler });
  container.register(DeliveryPickedUpHandler, { useClass: DeliveryPickedUpHandler });
  container.register(DeliveryDeliveredHandler, { useClass: DeliveryDeliveredHandler });

  // Attach handlers to Event Dispatcher
  const dispatcher = EventDispatcher.getInstance();
  dispatcher.register('OrderReadyEvent', container.resolve(OrderReadyHandler));
  dispatcher.register('DeliveryPickedUpEvent', container.resolve(DeliveryPickedUpHandler));
  dispatcher.register('DeliveryDeliveredEvent', container.resolve(DeliveryDeliveredHandler));
}
