import { inject, injectable } from 'tsyringe';
import { ICreateRestaurantUseCase } from './create-restaurant.use-case.js';
import { CreateRestaurantDto, RestaurantResponseDto } from '../dto/restaurant.dto.js';
import type { IRestaurantRepository } from '../../domain/repositories/restaurant.repository.js';
import { RestaurantTokens } from '../../infrastructure/persistence/tokens/restaurant.tokens.js';
import { IdentityTokens } from '../../../identity/infrastructure/persistence/tokens/identity.tokens.js';
import type { IUserRepository } from '../../../identity/domain/repositories/user.repository.js';
import { RestaurantDomainError } from '../../domain/errors/restaurant-domain.error.js';
import { Restaurant } from '../../domain/entities/restaurant.entity.js';
import { RestaurantName, Address } from '../../domain/value-objects/index.js';
import { CustomerPhoneNumber } from '../../../customer/domain/value-objects/index.js';
import { Email } from '../../../identity/domain/value-objects/email.vo.js';
import { Role } from '../../../identity/domain/enums/role.enum.js';
import type { ILogger } from '../../../../shared/logger/logger.interface.js';
import { InfrastructureTokens } from '../../../../infrastructure/container/tokens/index.js';

@injectable()
export class CreateRestaurantUseCaseImpl implements ICreateRestaurantUseCase {
  private readonly logger: ILogger;

  constructor(
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,

    @inject(IdentityTokens.UserRepository)
    private readonly userRepo: IUserRepository,

    @inject(InfrastructureTokens.Logger)
    logger: ILogger,
  ) {
    this.logger = logger.child({ component: 'CreateRestaurantUseCase' });
  }

  async execute(userId: string, dto: CreateRestaurantDto): Promise<RestaurantResponseDto> {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new RestaurantDomainError('User not found');
    }

    if (!user.hasRole(Role.RESTAURANT_OWNER)) {
      throw new RestaurantDomainError('User does not have RESTAURANT_OWNER role');
    }

    const restaurant = Restaurant.create({
      ownerId: userId,
      name: new RestaurantName(dto.name),
      description: dto.description ?? null,
      phoneNumber: new CustomerPhoneNumber(dto.phoneNumber),
      email: new Email(dto.email),
      address: new Address(dto.address),
    });

    await this.restaurantRepo.save(restaurant);

    this.logger.info(`Restaurant created successfully`, {
      restaurantId: restaurant.getId(),
      ownerId: userId,
    });

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
