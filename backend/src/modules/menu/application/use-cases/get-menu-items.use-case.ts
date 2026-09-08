import { MenuItemResponseDto } from '../dto/menu-item.dto.js';

export interface IGetMenuItemsUseCase {
  execute(restaurantId: string, categoryId?: string): Promise<MenuItemResponseDto[]>;
}
