import { RestaurantResponseDto } from '../dto/restaurant.dto.js';

export interface ISuspendRestaurantUseCase {
  execute(restaurantId: string): Promise<RestaurantResponseDto>;
}
