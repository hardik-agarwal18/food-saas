import { inject, injectable } from 'tsyringe';
import { IApproveRestaurantUseCase } from './approve-restaurant.use-case.js';
import type { IRestaurantRepository } from '../../../../modules/restaurant/domain/repositories/restaurant.repository.js';
import { RestaurantTokens } from '../../../../modules/restaurant/infrastructure/persistence/tokens/restaurant.tokens.js';
import { RestaurantResponseDto } from '../../../../modules/restaurant/application/dto/restaurant.dto.js';
import { NotFoundError } from '../../../../shared/errors/NotFoundError.js';

@injectable()
export class ApproveRestaurantUseCaseImpl implements IApproveRestaurantUseCase {
  constructor(
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepository: IRestaurantRepository,
  ) {}

  async execute(restaurantId: string): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant) throw new NotFoundError('Restaurant not found');

    restaurant.activate();
    await this.restaurantRepository.update(restaurant);

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
