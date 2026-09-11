import { MenuModifierItemResponseDto } from '../dto/menu-modifier.dto.js';

export interface IGetMenuModifierItemsUseCase {
  execute(restaurantId: string, modifierGroupId: string): Promise<MenuModifierItemResponseDto[]>;
}
