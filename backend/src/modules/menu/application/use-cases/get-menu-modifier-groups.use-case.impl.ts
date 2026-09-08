import { injectable, inject } from 'tsyringe';
import type { IGetMenuModifierGroupsUseCase } from './get-menu-modifier-groups.use-case.js';
import { MenuModifierGroupResponseDto } from '../dto/menu-modifier.dto.js';
import { MenuTokens } from '../../infrastructure/persistence/tokens/menu.tokens.js';
import type { IMenuModifierRepository } from '../../domain/repositories/menu-modifier.repository.js';
import { MenuDtoMapper } from '../mappers/menu-dto.mapper.js';
import { RestaurantTokens } from '../../../restaurant/infrastructure/persistence/tokens/restaurant.tokens.js';
import type { IRestaurantRepository } from '../../../restaurant/domain/repositories/restaurant.repository.js';
import { MenuDomainError } from '../../domain/errors/menu-domain.error.js';

@injectable()
export class GetMenuModifierGroupsUseCaseImpl implements IGetMenuModifierGroupsUseCase {
  constructor(
    @inject(MenuTokens.MenuModifierRepository)
    private readonly menuModifierRepo: IMenuModifierRepository,
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  async execute(restaurantId: string): Promise<MenuModifierGroupResponseDto[]> {
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant) {
      throw new MenuDomainError('Restaurant not found');
    }

    const groups = await this.menuModifierRepo.findGroupsByRestaurantId(restaurantId);

    return groups.map((g) => MenuDtoMapper.modifierGroupToResponse(g));
  }
}
