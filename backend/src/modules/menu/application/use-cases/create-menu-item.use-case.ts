import { CreateMenuItemDto, MenuItemResponseDto } from '../dto/menu-item.dto.js';

export interface ICreateMenuItemUseCase {
  execute(
    restaurantId: string,
    userId: string,
    dto: CreateMenuItemDto,
  ): Promise<MenuItemResponseDto>;
}
