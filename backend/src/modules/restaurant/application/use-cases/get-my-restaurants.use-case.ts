import { RestaurantResponseDto } from '../dto/restaurant.dto.js';

export interface IGetMyRestaurantsUseCase {
  execute(ownerId: string): Promise<RestaurantResponseDto[]>;
}
