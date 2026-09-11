import { inject, injectable } from 'tsyringe';
import { IGetMyRestaurantsUseCase } from './get-my-restaurants.use-case.js';
import { RestaurantResponseDto } from '../dto/restaurant.dto.js';
import type { IRestaurantRepository } from '../../domain/repositories/restaurant.repository.js';
import { RestaurantTokens } from '../../infrastructure/persistence/tokens/restaurant.tokens.js';

@injectable()
export class GetMyRestaurantsUseCaseImpl implements IGetMyRestaurantsUseCase {
  constructor(
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  async execute(ownerId: string): Promise<RestaurantResponseDto[]> {
    const restaurants = await this.restaurantRepo.findByOwnerId(ownerId);

    return restaurants.map((restaurant) => ({
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
