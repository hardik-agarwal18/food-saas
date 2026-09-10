import { inject, injectable } from 'tsyringe';
import { IGetPendingRestaurantsUseCase } from './get-pending-restaurants.use-case.js';
import type { IRestaurantRepository } from '../../../../modules/restaurant/domain/repositories/restaurant.repository.js';
import { RestaurantTokens } from '../../../../modules/restaurant/infrastructure/persistence/tokens/restaurant.tokens.js';
import { RestaurantResponseDto } from '../../../../modules/restaurant/application/dto/restaurant.dto.js';
import { RestaurantStatus } from '../../../../modules/restaurant/domain/entities/restaurant.entity.js';

@injectable()
export class GetPendingRestaurantsUseCaseImpl implements IGetPendingRestaurantsUseCase {
  constructor(
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepository: IRestaurantRepository,
  ) {}

  async execute(): Promise<RestaurantResponseDto[]> {
    const { items } = await this.restaurantRepository.findAll({
      status: RestaurantStatus.PENDING,
      limit: 100,
    });

    return items.map((restaurant) => ({
      id: restaurant.getId(),
      ownerId: restaurant.getOwnerId(),
      name: restaurant.getName().getValue(),
      description: restaurant.getDescription(),
      logoUrl: restaurant.getLogoUrl(),
      coverImageUrl: restaurant.getCoverImageUrl(),
      phoneNumber: restaurant.getPhoneNumber().getValue(),
      email: restaurant.getEmail().getValue(),
      address: restaurant.getAddress().toPrimitives(),
      latitude: restaurant.getLatitude(),
      longitude: restaurant.getLongitude(),
      status: restaurant.getStatus(),
      createdAt: restaurant.getCreatedAt().toISOString(),
      updatedAt: restaurant.getUpdatedAt().toISOString(),
    }));
  }
}
