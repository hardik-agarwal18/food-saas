import { injectable, inject } from 'tsyringe';
import { EventHandler } from '../../../../shared/events/event-dispatcher.js';
import { OrderPlacedEvent } from '../../../ordering/domain/events/order-placed.event.js';
import { logger } from '../../../../infrastructure/observability/logger/pino.js';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';
import type { ICreateDeliveryAssignmentUseCase } from './create-delivery-assignment.use-case.js';
import type { IDeliveryAssignmentRepository } from '../../domain/repositories/delivery-assignment.repository.js';
import type { DriverLocationService } from '../services/driver-location.service.js';
import type { IMqttBroadcasterService } from '../../infrastructure/mqtt/mqtt-broadcaster.service.js';
import { prisma } from '../../../../infrastructure/database/prisma.js';

@injectable()
export class DispatchOrderUseCase implements EventHandler<OrderPlacedEvent> {
  private readonly logger = logger.child({ context: 'DispatchOrderUseCase' });
  private prisma = prisma; // For cross-module data fetching (restaurant coords)

  constructor(
    @inject(DeliveryTokens.CreateDeliveryAssignmentUseCase)
    private readonly createAssignment: ICreateDeliveryAssignmentUseCase,
    @inject(DeliveryTokens.DeliveryAssignmentRepository)
    private readonly assignmentRepository: IDeliveryAssignmentRepository,
    @inject(DeliveryTokens.DriverLocationService)
    private readonly locationService: DriverLocationService,
    @inject(DeliveryTokens.MqttBroadcasterService)
    private readonly mqttBroadcaster: IMqttBroadcasterService,
  ) {}

  async handle(event: OrderPlacedEvent): Promise<void> {
    this.logger.info({ orderId: event.orderId }, 'Dispatching new order to nearby drivers');

    try {
      // 0. Idempotency Check
      const existingAssignments = await this.assignmentRepository.findByOrderId(event.orderId);
      if (existingAssignments.length > 0) {
        this.logger.info(
          { orderId: event.orderId },
          'Delivery assignment already exists. Skipping dispatch to ensure idempotency.',
        );
        return;
      }

      // 1. Get Restaurant Coordinates
      const restaurant = await this.prisma.restaurant.findUnique({
        where: { id: event.restaurantId },
        select: { latitude: true, longitude: true },
      });

      if (!restaurant || !restaurant.latitude || !restaurant.longitude) {
        this.logger.error(
          { restaurantId: event.restaurantId },
          'Restaurant location missing, cannot dispatch order',
        );
        return;
      }

      const pickupLat = Number(restaurant.latitude);
      const pickupLng = Number(restaurant.longitude);

      // 2. Find Nearby Drivers with expanding H3 rings
      const initialRadius = Number(process.env.DISPATCH_INITIAL_SEARCH_RADIUS || 1);
      const maxRadius = Number(process.env.DISPATCH_MAX_SEARCH_RADIUS || 5);

      let nearbyDrivers: Array<{ driverId: string }> = [];
      let currentRadius = initialRadius;

      while (currentRadius <= maxRadius && nearbyDrivers.length === 0) {
        this.logger.debug({ currentRadius }, 'Searching for drivers in H3 ring');
        nearbyDrivers = await this.locationService.getNearbyDrivers(
          pickupLat,
          pickupLng,
          currentRadius,
        );
        currentRadius++;
      }

      if (!nearbyDrivers || nearbyDrivers.length === 0) {
        this.logger.warn(
          { orderId: event.orderId, maxRadius },
          'No nearby drivers found for dispatch after expanding search',
        );
        return;
      }

      // 3. (Filtering is already handled by DriverLocationService)
      // The DriverLocationService already filters by ACTIVE TTL and AVAILABLE status.
      // We can just use the returned drivers.
      const availableDrivers = nearbyDrivers.map((d) => ({ id: d.driverId }));

      if (availableDrivers.length === 0) {
        this.logger.warn({ orderId: event.orderId }, 'No AVAILABLE drivers found for dispatch');
        return;
      }

      // 4. Create PENDING Delivery Assignment (expires in 60 seconds)
      const expiresAt = new Date(Date.now() + 60 * 1000);
      const assignment = await this.createAssignment.execute(
        event.orderId,
        event.deliveryFeeAmount,
        expiresAt,
      );

      // Transition state to OFFERED and save
      assignment.markOffered();
      await this.assignmentRepository.save(assignment);

      // 5. Broadcast Offer
      for (const driver of availableDrivers) {
        await this.mqttBroadcaster.broadcastDeliveryOffer(driver.id, {
          assignmentId: assignment.id,
          deliveryId: assignment.orderId, // We use orderId as deliveryId for now
          pickup: { lat: pickupLat, lng: pickupLng },
          expiresAt: expiresAt.toISOString(),
        });
      }

      this.logger.info(
        { orderId: event.orderId, broadcastCount: availableDrivers.length },
        'Successfully dispatched order offers',
      );
    } catch (error) {
      this.logger.error({ error, orderId: event.orderId }, 'Failed to dispatch order');
    }
  }
}
