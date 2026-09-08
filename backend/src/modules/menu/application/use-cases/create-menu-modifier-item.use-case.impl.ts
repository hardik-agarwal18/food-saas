import { injectable, inject } from 'tsyringe';
import type { ICreateMenuModifierItemUseCase } from './create-menu-modifier-item.use-case.js';
import {
  CreateMenuModifierItemDto,
  MenuModifierItemResponseDto,
} from '../dto/menu-modifier.dto.js';
import { MenuTokens } from '../../infrastructure/persistence/tokens/menu.tokens.js';
import type { IMenuModifierRepository } from '../../domain/repositories/menu-modifier.repository.js';
import { MenuModifierItem } from '../../domain/entities/menu-modifier-item.entity.js';
import { Money } from '../../domain/value-objects/money.vo.js';
import { MenuDtoMapper } from '../mappers/menu-dto.mapper.js';
import { RestaurantTokens } from '../../../restaurant/infrastructure/persistence/tokens/restaurant.tokens.js';
import type { IRestaurantRepository } from '../../../restaurant/domain/repositories/restaurant.repository.js';
import { MenuDomainError } from '../../domain/errors/menu-domain.error.js';

@injectable()
export class CreateMenuModifierItemUseCaseImpl implements ICreateMenuModifierItemUseCase {
  constructor(
    @inject(MenuTokens.MenuModifierRepository)
    private readonly menuModifierRepo: IMenuModifierRepository,
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  async execute(
    restaurantId: string,
    modifierGroupId: string,
    userId: string,
    dto: CreateMenuModifierItemDto,
  ): Promise<MenuModifierItemResponseDto> {
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant) {
      throw new MenuDomainError('Restaurant not found');
    }

    if (restaurant.getOwnerId() !== userId) {
      throw new MenuDomainError('Unauthorized to modify this restaurant menu');
    }

    const group = await this.menuModifierRepo.findGroupById(modifierGroupId);
    if (!group || group.getRestaurantId() !== restaurantId) {
      throw new MenuDomainError('Modifier group not found or belongs to another restaurant');
    }

    const item = MenuModifierItem.create({
      modifierGroupId,
      name: dto.name,
      priceAdjustment: Money.fromNumber(dto.priceAdjustment),
      sortOrder: dto.sortOrder,
    });

    await this.menuModifierRepo.saveItem(item);

    return MenuDtoMapper.modifierItemToResponse(item);
  }
}
