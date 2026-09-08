import { injectable, inject } from 'tsyringe';
import type { ICreateMenuCategoryUseCase } from './create-menu-category.use-case.js';
import { CreateMenuCategoryDto, MenuCategoryResponseDto } from '../dto/menu-category.dto.js';
import { MenuTokens } from '../../infrastructure/persistence/tokens/menu.tokens.js';
import type { IMenuCategoryRepository } from '../../domain/repositories/menu-category.repository.js';
import { MenuCategory } from '../../domain/entities/menu-category.entity.js';
import { MenuDtoMapper } from '../mappers/menu-dto.mapper.js';
import { RestaurantTokens } from '../../../restaurant/infrastructure/persistence/tokens/restaurant.tokens.js';
import type { IRestaurantRepository } from '../../../restaurant/domain/repositories/restaurant.repository.js';
import { MenuDomainError } from '../../domain/errors/menu-domain.error.js';

@injectable()
export class CreateMenuCategoryUseCaseImpl implements ICreateMenuCategoryUseCase {
  constructor(
    @inject(MenuTokens.MenuCategoryRepository)
    private readonly menuCategoryRepo: IMenuCategoryRepository,
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  async execute(
    restaurantId: string,
    userId: string,
    dto: CreateMenuCategoryDto,
  ): Promise<MenuCategoryResponseDto> {
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant) {
      throw new MenuDomainError('Restaurant not found');
    }

    if (restaurant.getOwnerId() !== userId) {
      throw new MenuDomainError('Unauthorized to modify this restaurant menu');
    }

    const category = MenuCategory.create({
      restaurantId,
      name: dto.name,
      description: dto.description ?? null,
      sortOrder: dto.sortOrder,
    });

    await this.menuCategoryRepo.save(category);

    return MenuDtoMapper.categoryToResponse(category);
  }
}
