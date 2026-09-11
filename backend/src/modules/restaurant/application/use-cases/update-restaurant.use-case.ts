import { UpdateRestaurantDto, RestaurantResponseDto } from '../dto/restaurant.dto.js';

export interface IUpdateRestaurantUseCase {
  execute(
    restaurantId: string,
    requesterId: string,
    dto: UpdateRestaurantDto,
  ): Promise<RestaurantResponseDto>;
}
