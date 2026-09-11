import { OrderResponseDto } from '../dto/order.dto.js';
import { PaginatedResult, PaginationOptions } from '../../domain/repositories/order.repository.js';

export interface IGetRestaurantOrdersUseCase {
  execute(
    restaurantId: string,
    userId: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<OrderResponseDto>>;
}
