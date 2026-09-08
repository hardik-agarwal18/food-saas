import { RestaurantResponseDto } from '../dto/restaurant.dto.js';

export interface IGetRestaurantByIdUseCase {
  execute(id: string): Promise<RestaurantResponseDto>;
}
