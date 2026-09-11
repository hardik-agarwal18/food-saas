import {
  CreateMenuModifierGroupDto,
  MenuModifierGroupResponseDto,
} from '../dto/menu-modifier.dto.js';

export interface ICreateMenuModifierGroupUseCase {
  execute(
    restaurantId: string,
    userId: string,
    dto: CreateMenuModifierGroupDto,
  ): Promise<MenuModifierGroupResponseDto>;
}
