import { injectable, inject } from 'tsyringe';
import type {
  GetDeliveryLocationInput,
  DeliveryLocationDto,
  IGetDeliveryLocationUseCase,
} from './get-delivery-location.use-case.js';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';
import type { IDeliveryAssignmentRepository } from '../../domain/repositories/delivery-assignment.repository.js';
import { DriverLocationService } from '../services/driver-location.service.js';
import { OrderingTokens } from '../../../ordering/infrastructure/tokens/ordering.tokens.js';
import type { IOrderRepository } from '../../../ordering/domain/repositories/order.repository.js';
import { RestaurantTokens } from '../../../restaurant/infrastructure/persistence/tokens/restaurant.tokens.js';
import type { IRestaurantRepository } from '../../../restaurant/domain/repositories/restaurant.repository.js';

@injectable()
export class GetDeliveryLocationUseCaseImpl implements IGetDeliveryLocationUseCase {
  constructor(
    @inject(DeliveryTokens.DeliveryAssignmentRepository)
    private readonly assignmentRepo: IDeliveryAssignmentRepository,
    @inject(DeliveryTokens.DriverLocationService)
    private readonly locationService: DriverLocationService,
    @inject(OrderingTokens.OrderRepository)
    private readonly orderRepo: IOrderRepository,
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  async execute(input: GetDeliveryLocationInput): Promise<DeliveryLocationDto | null> {
    const { actorId, actorRoles, assignmentId, orderId } = input;

    let assignment;
    if (assignmentId) {
      assignment = await this.assignmentRepo.findById(assignmentId);
    } else if (orderId) {
      const assignments = await this.assignmentRepo.findByOrderId(orderId);
      assignment =
        assignments.find(
          (a) =>
            a.status === 'ACCEPTED' ||
            a.status === 'PICKED_UP' ||
            a.status === 'DRIVER_ARRIVING' ||
            a.status === 'DELIVERED',
        ) || assignments[0];
    }

    if (!assignment) {
      throw new Error('Delivery assignment not found');
    }

    if (!assignment.driverId) {
      throw new Error('No driver assigned to this delivery yet');
    }

    // ─── AUTHORIZATION ────────────────────────────────────────────────────────

    let isAuthorized = false;

    // 1. ADMIN is always allowed
    if (actorRoles.includes('ADMIN')) {
      isAuthorized = true;
    }
    // 2. DRIVER must be the assigned driver
    else if (actorRoles.includes('DRIVER') && assignment.driverId === actorId) {
      isAuthorized = true;
    }
    // 3. CUSTOMER must own the order
    // 4. RESTAURANT_OWNER must own the restaurant
    else if (actorRoles.includes('CUSTOMER') || actorRoles.includes('RESTAURANT_OWNER')) {
      const order = await this.orderRepo.findById(assignment.orderId);
      if (order) {
        if (actorRoles.includes('CUSTOMER') && order.getCustomerId() === actorId) {
          isAuthorized = true;
        } else if (actorRoles.includes('RESTAURANT_OWNER')) {
          const restaurant = await this.restaurantRepo.findById(order.getRestaurantId());
          if (restaurant && restaurant.getOwnerId() === actorId) {
            isAuthorized = true;
          }
        }
      }
    }

    if (!isAuthorized) {
      throw new Error('Unauthorized access to delivery location');
    }

    // ─── GET LOCATION ─────────────────────────────────────────────────────────

    const location = await this.locationService.getLocation(assignment.driverId);

    if (!location) {
      return null;
    }

    return {
      longitude: parseFloat(location[0]),
      latitude: parseFloat(location[1]),
      updatedAt: new Date(), // We don't store timestamps in redis geospatial index natively, but we could fetch it if stored separately
    };
  }
}
