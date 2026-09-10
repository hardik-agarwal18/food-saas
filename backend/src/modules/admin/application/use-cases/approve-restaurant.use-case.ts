import { RestaurantResponseDto } from '../../../../modules/restaurant/application/dto/restaurant.dto.js';

export interface IApproveRestaurantUseCase {
  execute(restaurantId: string): Promise<RestaurantResponseDto>;
}
