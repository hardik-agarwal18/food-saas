import { RestaurantResponseDto } from '../../../../modules/restaurant/application/dto/restaurant.dto.js';

export interface ISuspendRestaurantUseCase {
  execute(restaurantId: string): Promise<RestaurantResponseDto>;
}
