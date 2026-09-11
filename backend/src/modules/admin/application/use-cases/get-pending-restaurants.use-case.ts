import { RestaurantResponseDto } from '../../../../modules/restaurant/application/dto/restaurant.dto.js';

export interface IGetPendingRestaurantsUseCase {
  execute(): Promise<RestaurantResponseDto[]>;
}
