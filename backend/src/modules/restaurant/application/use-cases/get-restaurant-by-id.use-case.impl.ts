import { inject, injectable } from 'tsyringe';
import { IGetRestaurantByIdUseCase } from './get-restaurant-by-id.use-case.js';
import { RestaurantResponseDto } from '../dto/restaurant.dto.js';
import type { IRestaurantRepository } from '../../domain/repositories/restaurant.repository.js';
import { RestaurantTokens } from '../../infrastructure/persistence/tokens/restaurant.tokens.js';
import { NotFoundError } from '../../../../shared/errors/NotFoundError.js';

@injectable()
export class GetRestaurantByIdUseCaseImpl implements IGetRestaurantByIdUseCase {
  constructor(
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  async execute(id: string): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantRepo.findById(id);

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    return {
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
    };
  }
}
