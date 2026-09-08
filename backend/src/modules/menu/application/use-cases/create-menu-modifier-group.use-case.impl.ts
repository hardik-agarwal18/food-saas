import { injectable, inject } from 'tsyringe';
import type { ICreateMenuModifierGroupUseCase } from './create-menu-modifier-group.use-case.js';
import {
  CreateMenuModifierGroupDto,
  MenuModifierGroupResponseDto,
} from '../dto/menu-modifier.dto.js';
import { MenuTokens } from '../../infrastructure/persistence/tokens/menu.tokens.js';
import type { IMenuModifierRepository } from '../../domain/repositories/menu-modifier.repository.js';
import { MenuModifierGroup } from '../../domain/entities/menu-modifier-group.entity.js';
import { MenuDtoMapper } from '../mappers/menu-dto.mapper.js';
import { RestaurantTokens } from '../../../restaurant/infrastructure/persistence/tokens/restaurant.tokens.js';
import type { IRestaurantRepository } from '../../../restaurant/domain/repositories/restaurant.repository.js';
import { MenuDomainError } from '../../domain/errors/menu-domain.error.js';

@injectable()
export class CreateMenuModifierGroupUseCaseImpl implements ICreateMenuModifierGroupUseCase {
  constructor(
    @inject(MenuTokens.MenuModifierRepository)
    private readonly menuModifierRepo: IMenuModifierRepository,
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  async execute(
    restaurantId: string,
    userId: string,
    dto: CreateMenuModifierGroupDto,
  ): Promise<MenuModifierGroupResponseDto> {
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant) {
      throw new MenuDomainError('Restaurant not found');
    }

    if (restaurant.getOwnerId() !== userId) {
      throw new MenuDomainError('Unauthorized to modify this restaurant menu');
    }

    const group = MenuModifierGroup.create({
      restaurantId,
      name: dto.name,
      description: dto.description ?? null,
      isRequired: dto.isRequired,
      minSelections: dto.minSelections,
      maxSelections: dto.maxSelections ?? null,
    });

    await this.menuModifierRepo.saveGroup(group);

    return MenuDtoMapper.modifierGroupToResponse(group);
  }
}
