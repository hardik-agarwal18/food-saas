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

  async execute(restaurantId: string): Promise<RestaurantAnalyticsDto> {
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant) {
      throw new OrderingDomainError('Restaurant not found');
    }

    const today = new Date();
    const analytics = await this.orderRepo.getAnalytics(restaurantId, today);

    return analytics;
  }
}
