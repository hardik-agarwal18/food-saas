import { RestaurantResponseDto } from '../dto/restaurant.dto.js';

export interface IDeactivateRestaurantUseCase {
  execute(restaurantId: string, requesterId: string): Promise<RestaurantResponseDto>;
}
