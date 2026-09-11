import { MenuCategoryResponseDto } from '../dto/menu-category.dto.js';

export interface IGetMenuCategoriesUseCase {
  execute(restaurantId: string): Promise<MenuCategoryResponseDto[]>;
}
