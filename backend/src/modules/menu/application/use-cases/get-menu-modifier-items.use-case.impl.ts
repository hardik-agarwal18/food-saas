import { injectable, inject } from 'tsyringe';
import type { IGetMenuModifierItemsUseCase } from './get-menu-modifier-items.use-case.js';
import { MenuModifierItemResponseDto } from '../dto/menu-modifier.dto.js';
import { MenuTokens } from '../../infrastructure/persistence/tokens/menu.tokens.js';
import type { IMenuModifierRepository } from '../../domain/repositories/menu-modifier.repository.js';
import { MenuDtoMapper } from '../mappers/menu-dto.mapper.js';
import { MenuDomainError } from '../../domain/errors/menu-domain.error.js';

@injectable()
export class GetMenuModifierItemsUseCaseImpl implements IGetMenuModifierItemsUseCase {
  constructor(
    @inject(MenuTokens.MenuModifierRepository)
    private readonly menuModifierRepo: IMenuModifierRepository,
  ) {}

  async execute(
    restaurantId: string,
    modifierGroupId: string,
  ): Promise<MenuModifierItemResponseDto[]> {
    const group = await this.menuModifierRepo.findGroupById(modifierGroupId);
    if (!group || group.getRestaurantId() !== restaurantId) {
      throw new MenuDomainError('Modifier group not found');
    }

    const items = await this.menuModifierRepo.findItemsByGroupId(modifierGroupId);

    return items.map((i) => MenuDtoMapper.modifierItemToResponse(i));
  }
}
