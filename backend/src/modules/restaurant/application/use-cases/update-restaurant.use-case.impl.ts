import { inject, injectable } from 'tsyringe';
import { IUpdateRestaurantUseCase } from './update-restaurant.use-case.js';
import { UpdateRestaurantDto, RestaurantResponseDto } from '../dto/restaurant.dto.js';
import type { IRestaurantRepository } from '../../domain/repositories/restaurant.repository.js';
import { RestaurantTokens } from '../../infrastructure/persistence/tokens/restaurant.tokens.js';
import { NotFoundError } from '../../../../shared/errors/NotFoundError.js';
import { RestaurantDomainError } from '../../domain/errors/restaurant-domain.error.js';
import { RestaurantName, Address } from '../../domain/value-objects/index.js';
import { CustomerPhoneNumber } from '../../../customer/domain/value-objects/index.js';
import { Email } from '../../../identity/domain/value-objects/email.vo.js';

@injectable()
export class UpdateRestaurantUseCaseImpl implements IUpdateRestaurantUseCase {
  constructor(
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  async execute(
    restaurantId: string,
    requesterId: string,
    dto: UpdateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantRepo.findById(restaurantId);

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    if (restaurant.getOwnerId() !== requesterId) {
      throw new RestaurantDomainError('You do not own this restaurant');
    }

    if (restaurant.isDeleted()) {
      throw new RestaurantDomainError('Cannot update a deleted restaurant');
    }

    restaurant.updateProfile({
      name: dto.name ? new RestaurantName(dto.name) : undefined,
      description: dto.description,
      phoneNumber: dto.phoneNumber ? new CustomerPhoneNumber(dto.phoneNumber) : undefined,
      email: dto.email ? new Email(dto.email) : undefined,
      address: dto.address ? new Address(dto.address) : undefined,
    });

    await this.restaurantRepo.update(restaurant);

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
