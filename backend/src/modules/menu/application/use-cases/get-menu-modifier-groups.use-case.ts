import { MenuModifierGroupResponseDto } from '../dto/menu-modifier.dto.js';

export interface IGetMenuModifierGroupsUseCase {
  execute(restaurantId: string): Promise<MenuModifierGroupResponseDto[]>;
}
