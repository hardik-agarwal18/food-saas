import { container } from 'tsyringe';
import { DeliveryTokens } from '../../../modules/delivery/infrastructure/tokens/delivery.tokens.js';
import { DriverRepositoryImpl } from '../../../modules/delivery/infrastructure/persistence/prisma/driver.repository.js';
import { DeliveryAssignmentRepositoryImpl } from '../../../modules/delivery/infrastructure/persistence/prisma/delivery-assignment.repository.js';
import { RegisterDriverUseCaseImpl } from '../../../modules/delivery/application/use-cases/register-driver.use-case.impl.js';
import { ToggleDriverAvailabilityUseCaseImpl } from '../../../modules/delivery/application/use-cases/toggle-driver-availability.use-case.impl.js';
import { CreateDeliveryAssignmentUseCaseImpl } from '../../../modules/delivery/application/use-cases/create-delivery-assignment.use-case.impl.js';
import { ClaimDeliveryAssignmentUseCaseImpl } from '../../../modules/delivery/application/use-cases/claim-delivery-assignment.use-case.impl.js';
import { UpdateDeliveryStatusUseCaseImpl } from '../../../modules/delivery/application/use-cases/update-delivery-status.use-case.impl.js';
import { GetAvailableDeliveriesUseCaseImpl } from '../../../modules/delivery/application/use-cases/get-available-deliveries.use-case.impl.js';
import { GetDriverAssignmentsUseCaseImpl } from '../../../modules/delivery/application/use-cases/get-driver-assignments.use-case.impl.js';
import { UpdateDriverLocationUseCaseImpl } from '../../../modules/delivery/application/use-cases/update-driver-location.use-case.impl.js';
import { OnOrderReadyHandler } from '../../../modules/delivery/application/event-handlers/on-order-ready.handler.js';
import { OnDeliveryPickedUpHandler } from '../../../modules/ordering/application/event-handlers/on-delivery-picked-up.handler.js';
import { OnDeliveryDeliveredHandler } from '../../../modules/ordering/application/event-handlers/on-delivery-delivered.handler.js';
import { EventDispatcher } from '../../../shared/events/event-dispatcher.js';

export function registerDeliveryModule() {
  container.registerSingleton(DeliveryTokens.DriverRepository, DriverRepositoryImpl);
  container.registerSingleton(
    DeliveryTokens.DeliveryAssignmentRepository,
    DeliveryAssignmentRepositoryImpl,
  );
  container.registerSingleton(DeliveryTokens.RegisterDriverUseCase, RegisterDriverUseCaseImpl);
  container.registerSingleton(
    DeliveryTokens.ToggleDriverAvailabilityUseCase,
    ToggleDriverAvailabilityUseCaseImpl,
  );
  container.registerSingleton(
    DeliveryTokens.CreateDeliveryAssignmentUseCase,
    CreateDeliveryAssignmentUseCaseImpl,
  );
  container.registerSingleton(
    DeliveryTokens.ClaimDeliveryAssignmentUseCase,
    ClaimDeliveryAssignmentUseCaseImpl,
  );
  container.registerSingleton(
    DeliveryTokens.UpdateDeliveryStatusUseCase,
    UpdateDeliveryStatusUseCaseImpl,
  );
  container.registerSingleton(
    DeliveryTokens.GetAvailableDeliveriesUseCase,
    GetAvailableDeliveriesUseCaseImpl,
  );
  container.registerSingleton(
    DeliveryTokens.GetDriverAssignmentsUseCase,
    GetDriverAssignmentsUseCaseImpl,
  );
  container.registerSingleton(
    DeliveryTokens.UpdateDriverLocationUseCase,
    UpdateDriverLocationUseCaseImpl,
  );

  const onOrderReadyHandler = container.resolve(OnOrderReadyHandler);
  const onDeliveryPickedUpHandler = container.resolve(OnDeliveryPickedUpHandler);
  const onDeliveryDeliveredHandler = container.resolve(OnDeliveryDeliveredHandler);

  const dispatcher = EventDispatcher.getInstance();
  dispatcher.register('OrderReadyEvent', onOrderReadyHandler);
  dispatcher.register('DeliveryPickedUpEvent', onDeliveryPickedUpHandler);
  dispatcher.register('DeliveryDeliveredEvent', onDeliveryDeliveredHandler);
}
