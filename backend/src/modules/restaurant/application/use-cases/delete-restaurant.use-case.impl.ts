import { inject, injectable } from 'tsyringe';
import { IDeleteRestaurantUseCase } from './delete-restaurant.use-case.js';
import type { IRestaurantRepository } from '../../domain/repositories/restaurant.repository.js';
import { RestaurantTokens } from '../../infrastructure/persistence/tokens/restaurant.tokens.js';
import { NotFoundError } from '../../../../shared/errors/NotFoundError.js';
import { RestaurantDomainError } from '../../domain/errors/restaurant-domain.error.js';

@injectable()
export class DeleteRestaurantUseCaseImpl implements IDeleteRestaurantUseCase {
  constructor(
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  async execute(restaurantId: string, requesterId: string): Promise<void> {
    const restaurant = await this.restaurantRepo.findById(restaurantId);

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    if (restaurant.getOwnerId() !== requesterId) {
      throw new RestaurantDomainError('You do not own this restaurant');
    }

    restaurant.delete();
    await this.restaurantRepo.update(restaurant);
  }
}
