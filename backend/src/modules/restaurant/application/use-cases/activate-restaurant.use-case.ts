import { RestaurantResponseDto } from '../dto/restaurant.dto.js';

export interface IActivateRestaurantUseCase {
  execute(restaurantId: string, requesterId: string): Promise<RestaurantResponseDto>;
}
