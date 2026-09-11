import { CreateRestaurantDto, RestaurantResponseDto } from '../dto/restaurant.dto.js';

export interface ICreateRestaurantUseCase {
  execute(userId: string, dto: CreateRestaurantDto): Promise<RestaurantResponseDto>;
}
