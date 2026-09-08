import {
  CreateMenuModifierItemDto,
  MenuModifierItemResponseDto,
} from '../dto/menu-modifier.dto.js';

export interface ICreateMenuModifierItemUseCase {
  execute(
    restaurantId: string,
    modifierGroupId: string,
    userId: string,
    dto: CreateMenuModifierItemDto,
  ): Promise<MenuModifierItemResponseDto>;
}
