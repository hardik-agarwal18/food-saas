import { inject, injectable } from 'tsyringe';
import { MenuTokens } from '../../../infrastructure/tokens/menu.tokens.js';
import type { MenuImportRepository } from '../../../domain/repositories/menu-import.repository.js';
import type { GetMenuImportInput, GetMenuImportUseCase } from './get-menu-import.use-case.js';
import { MenuImport } from '../../../domain/entities/menu-import.entity.js';
import { MenuDomainError } from '../../../domain/errors/menu-domain.error.js';
import { RestaurantTokens } from '../../../../restaurant/infrastructure/persistence/tokens/restaurant.tokens.js';
import type { IRestaurantRepository } from '../../../../restaurant/domain/repositories/restaurant.repository.js';

@injectable()
export class GetMenuImportUseCaseImpl implements GetMenuImportUseCase {
  constructor(
    @inject(MenuTokens.MenuImportRepository)
    private readonly menuImportRepository: MenuImportRepository,
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  async execute(input: GetMenuImportInput): Promise<MenuImport | null> {
    const importEntity = await this.menuImportRepository.findById(input.importId);

    if (importEntity && importEntity.getRestaurantId() !== input.restaurantId) {
      throw new MenuDomainError('Unauthorized access to menu import');
    }

    const restaurant = await this.restaurantRepo.findById(input.restaurantId);
    if (!restaurant) {
      throw new MenuDomainError('Restaurant not found');
    }
    if (restaurant.getOwnerId() !== input.actorId) {
      throw new MenuDomainError('Unauthorized to access this restaurant menu import');
    }

    return importEntity;
  }
}
