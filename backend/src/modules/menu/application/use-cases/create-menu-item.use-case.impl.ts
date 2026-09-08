import { injectable, inject } from 'tsyringe';
import type { ICreateMenuItemUseCase } from './create-menu-item.use-case.js';
import { CreateMenuItemDto, MenuItemResponseDto } from '../dto/menu-item.dto.js';
import { MenuTokens } from '../../infrastructure/persistence/tokens/menu.tokens.js';
import type { IMenuItemRepository } from '../../domain/repositories/menu-item.repository.js';
import type { IMenuCategoryRepository } from '../../domain/repositories/menu-category.repository.js';
import { MenuItem } from '../../domain/entities/menu-item.entity.js';
import { Money } from '../../domain/value-objects/money.vo.js';
import { MenuDtoMapper } from '../mappers/menu-dto.mapper.js';
import { RestaurantTokens } from '../../../restaurant/infrastructure/persistence/tokens/restaurant.tokens.js';
import type { IRestaurantRepository } from '../../../restaurant/domain/repositories/restaurant.repository.js';
import { MenuDomainError } from '../../domain/errors/menu-domain.error.js';

@injectable()
export class CreateMenuItemUseCaseImpl implements ICreateMenuItemUseCase {
  constructor(
    @inject(MenuTokens.MenuItemRepository)
    private readonly menuItemRepo: IMenuItemRepository,
    @inject(MenuTokens.MenuCategoryRepository)
    private readonly menuCategoryRepo: IMenuCategoryRepository,
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  async execute(
    restaurantId: string,
    userId: string,
    dto: CreateMenuItemDto,
  ): Promise<MenuItemResponseDto> {
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant) {
      throw new MenuDomainError('Restaurant not found');
    }

    if (restaurant.getOwnerId() !== userId) {
      throw new MenuDomainError('Unauthorized to modify this restaurant menu');
    }

    if (dto.categoryId) {
      const category = await this.menuCategoryRepo.findById(dto.categoryId);
      if (!category || category.getRestaurantId() !== restaurantId) {
        throw new MenuDomainError('Invalid category ID');
      }
    }

    const price = Money.fromNumber(dto.price);

    const item = MenuItem.create({
      restaurantId,
      categoryId: dto.categoryId,
      name: dto.name,
      description: dto.description ?? null,
      price,
      sortOrder: dto.sortOrder,
      modifierGroupIds: dto.modifierGroupIds,
    });

    await this.menuItemRepo.save(item);

    return MenuDtoMapper.itemToResponse(item);
  }
}
