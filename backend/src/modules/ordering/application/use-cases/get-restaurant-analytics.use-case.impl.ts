import { injectable, inject } from 'tsyringe';
import type {
  IGetRestaurantAnalyticsUseCase,
  RestaurantAnalyticsDto,
} from './get-restaurant-analytics.use-case.js';
import { OrderingTokens } from '../../infrastructure/tokens/ordering.tokens.js';
import type { IOrderRepository } from '../../domain/repositories/order.repository.js';
import { RestaurantTokens } from '../../../restaurant/infrastructure/persistence/tokens/restaurant.tokens.js';
import type { IRestaurantRepository } from '../../../restaurant/domain/repositories/restaurant.repository.js';
import { OrderingDomainError } from '../../domain/errors/ordering-domain.error.js';

@injectable()
export class GetRestaurantAnalyticsUseCaseImpl implements IGetRestaurantAnalyticsUseCase {
  constructor(
    @inject(OrderingTokens.OrderRepository)
    private readonly orderRepo: IOrderRepository,
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  async execute(userId: string, restaurantId: string): Promise<RestaurantAnalyticsDto> {
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant) {
      throw new OrderingDomainError('Restaurant not found');
    }

    if (restaurant.getOwnerId() !== userId) {
      throw new OrderingDomainError('Not authorized to access these analytics');
    }

    // TODO: A proper fix would use `restaurant.timezone` to calculate local business-day boundaries
    // and then convert them to UTC for the database query.
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
    );

    const analytics = await this.orderRepo.getAnalytics(restaurantId, today);

    return analytics;
  }
}
