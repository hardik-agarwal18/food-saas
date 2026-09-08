import { inject, injectable } from 'tsyringe';
import { IGetRestaurantsUseCase } from './get-restaurants.use-case.js';
import { ListRestaurantsDto, ListRestaurantsResponseDto } from '../dto/restaurant.dto.js';
import type { IRestaurantRepository } from '../../domain/repositories/restaurant.repository.js';
import { RestaurantTokens } from '../../infrastructure/persistence/tokens/restaurant.tokens.js';
import { RestaurantStatus } from '../../domain/entities/restaurant.entity.js';

@injectable()
export class GetRestaurantsUseCaseImpl implements IGetRestaurantsUseCase {
  constructor(
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  async execute(dto: ListRestaurantsDto): Promise<ListRestaurantsResponseDto> {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;

    const statusMap: Record<string, RestaurantStatus> = {
      PENDING: RestaurantStatus.PENDING,
      ACTIVE: RestaurantStatus.ACTIVE,
      INACTIVE: RestaurantStatus.INACTIVE,
      SUSPENDED: RestaurantStatus.SUSPENDED,
    };

    const { items, total } = await this.restaurantRepo.findAll({
      status: dto.status ? statusMap[dto.status] : RestaurantStatus.ACTIVE,
      city: dto.city,
      limit,
      offset,
    });

    return {
      items: items.map((restaurant) => ({
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
      })),
      total,
      limit,
      offset,
    };
  }
}
