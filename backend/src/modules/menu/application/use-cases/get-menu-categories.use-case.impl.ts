import { injectable, inject } from 'tsyringe';
import type { IGetMenuCategoriesUseCase } from './get-menu-categories.use-case.js';
import { MenuCategoryResponseDto } from '../dto/menu-category.dto.js';
import { MenuTokens } from '../../infrastructure/persistence/tokens/menu.tokens.js';
import type { IMenuCategoryRepository } from '../../domain/repositories/menu-category.repository.js';
import { MenuDtoMapper } from '../mappers/menu-dto.mapper.js';
import { RestaurantTokens } from '../../../restaurant/infrastructure/persistence/tokens/restaurant.tokens.js';
import type { IRestaurantRepository } from '../../../restaurant/domain/repositories/restaurant.repository.js';
import { MenuDomainError } from '../../domain/errors/menu-domain.error.js';

@injectable()
export class GetMenuCategoriesUseCaseImpl implements IGetMenuCategoriesUseCase {
  constructor(
    @inject(MenuTokens.MenuCategoryRepository)
    private readonly menuCategoryRepo: IMenuCategoryRepository,
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  async execute(restaurantId: string): Promise<MenuCategoryResponseDto[]> {
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant) {
      throw new MenuDomainError('Restaurant not found');
    }

    const categories = await this.menuCategoryRepo.findByRestaurantId(restaurantId);

    // We might want to filter active vs inactive later depending on who is querying (customer vs owner)
    // For now, return all non-deleted ones.
    return categories.map(MenuDtoMapper.categoryToResponse);
  }
}
