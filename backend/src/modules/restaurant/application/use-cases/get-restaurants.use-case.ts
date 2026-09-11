import { ListRestaurantsDto, ListRestaurantsResponseDto } from '../dto/restaurant.dto.js';

export interface IGetRestaurantsUseCase {
  execute(dto: ListRestaurantsDto): Promise<ListRestaurantsResponseDto>;
}
