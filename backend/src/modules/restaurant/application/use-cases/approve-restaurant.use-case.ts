import { RestaurantResponseDto } from '../dto/restaurant.dto.js';

export interface IApproveRestaurantUseCase {
  execute(restaurantId: string): Promise<RestaurantResponseDto>;
}
