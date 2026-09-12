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

import type { IRouteService } from '../../domain/services/route.service.interface.js';
import { Coordinates } from '../../../location/domain/value-objects/coordinates.vo.js';

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
    @inject(DeliveryTokens.RouteService)
    private readonly routeService: IRouteService,
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

      let nearbyDrivers: Array<{ driverId: string; lat: number; lng: number }> = [];
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

      // 3. Candidate discovery and filtering already handled by DriverLocationService
      if (!nearbyDrivers || nearbyDrivers.length === 0) {
        this.logger.warn(
          { orderId: event.orderId, maxRadius },
          'No AVAILABLE drivers found for dispatch after expanding search',
        );
        return;
      }

      // 4. Final Dispatch Sorting via Route Matrix
      const origin = Coordinates.create({ latitude: pickupLat, longitude: pickupLng });
      const destinations = nearbyDrivers.map((d) => ({
        id: d.driverId,
        coordinates: Coordinates.create({ latitude: d.lat, longitude: d.lng }),
      }));

      const routeResults = await this.routeService.getRoutes(origin, destinations);

      // Sort drivers by ETA (durationSeconds)
      routeResults.sort((a, b) => a.durationSeconds - b.durationSeconds);

      // Take top 3 drivers to offer (or 1 depending on business logic, here we broadcast to top 3)
      const topCandidates = routeResults.slice(0, 3);

      if (topCandidates.length === 0) {
        this.logger.warn(
          { orderId: event.orderId },
          'No drivers could be routed to the restaurant',
        );
        return;
      }

      // 5. Create PENDING Delivery Assignment (expires in 60 seconds)
      const expiresAt = new Date(Date.now() + 60 * 1000);
      const assignment = await this.createAssignment.execute(
        event.orderId,
        event.deliveryFeeAmount,
        expiresAt,
      );

      // Transition state to OFFERED and save
      assignment.markOffered();
      await this.assignmentRepository.save(assignment);

      // 6. Broadcast Offer to top ranked drivers
      for (const route of topCandidates) {
        await this.mqttBroadcaster.broadcastDeliveryOffer(route.driverId, {
          assignmentId: assignment.id,
          deliveryId: assignment.orderId, // We use orderId as deliveryId for now
          pickup: { lat: pickupLat, lng: pickupLng },
          expiresAt: expiresAt.toISOString(),
          estimatedETA: route.durationSeconds, // send ETA info
        });
      }

      this.logger.info(
        { orderId: event.orderId, broadcastCount: topCandidates.length },
        'Successfully dispatched order offers using Route Matrix sorting',
      );
    } catch (error) {
      this.logger.error({ error, orderId: event.orderId }, 'Failed to dispatch order');
    }
  }
}
