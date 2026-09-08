import { injectable, inject } from 'tsyringe';
import type { IGetRestaurantOrdersUseCase } from './get-restaurant-orders.use-case.js';
import { OrderResponseDto } from '../dto/order.dto.js';
import { OrderDtoMapper } from '../mappers/order-dto.mapper.js';
import { OrderingTokens } from '../../infrastructure/tokens/ordering.tokens.js';
import type {
  IOrderRepository,
  PaginatedResult,
  PaginationOptions,
} from '../../domain/repositories/order.repository.js';
import { RestaurantTokens } from '../../../restaurant/infrastructure/persistence/tokens/restaurant.tokens.js';
import type { IRestaurantRepository } from '../../../restaurant/domain/repositories/restaurant.repository.js';
import { OrderingDomainError } from '../../domain/errors/ordering-domain.error.js';

@injectable()
export class GetRestaurantOrdersUseCaseImpl implements IGetRestaurantOrdersUseCase {
  constructor(
    @inject(OrderingTokens.OrderRepository)
    private readonly orderRepo: IOrderRepository,
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  async execute(
    restaurantId: string,
    userId: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<OrderResponseDto>> {
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant) {
      throw new OrderingDomainError('Restaurant not found');
    }
    if (restaurant.getOwnerId() !== userId) {
      throw new OrderingDomainError('Unauthorized access to restaurant orders');
    }

    const result = await this.orderRepo.findByRestaurantId(restaurantId, options);

    return {
      data: result.data.map(OrderDtoMapper.toResponse),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
