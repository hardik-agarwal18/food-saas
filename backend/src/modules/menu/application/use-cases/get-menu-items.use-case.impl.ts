import { injectable, inject } from 'tsyringe';
import type { IGetMenuItemsUseCase } from './get-menu-items.use-case.js';
import { MenuItemResponseDto } from '../dto/menu-item.dto.js';
import { MenuTokens } from '../../infrastructure/persistence/tokens/menu.tokens.js';
import type { IMenuItemRepository } from '../../domain/repositories/menu-item.repository.js';
import { MenuDtoMapper } from '../mappers/menu-dto.mapper.js';
import { RestaurantTokens } from '../../../restaurant/infrastructure/persistence/tokens/restaurant.tokens.js';
import type { IRestaurantRepository } from '../../../restaurant/domain/repositories/restaurant.repository.js';
import { MenuDomainError } from '../../domain/errors/menu-domain.error.js';

@injectable()
export class GetMenuItemsUseCaseImpl implements IGetMenuItemsUseCase {
  constructor(
    @inject(MenuTokens.MenuItemRepository)
    private readonly menuItemRepo: IMenuItemRepository,
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  async execute(restaurantId: string, categoryId?: string): Promise<MenuItemResponseDto[]> {
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant) {
      throw new MenuDomainError('Restaurant not found');
    }

    let items = [];
    if (categoryId) {
      items = await this.menuItemRepo.findByCategoryId(categoryId);
      // Validate the category belongs to the restaurant if we wanted to be perfectly strict
    } else {
      items = await this.menuItemRepo.findByRestaurantId(restaurantId);
    }

    return items.map(MenuDtoMapper.itemToResponse);
  }
}
