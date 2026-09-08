import { CreateMenuCategoryDto, MenuCategoryResponseDto } from '../dto/menu-category.dto.js';

export interface ICreateMenuCategoryUseCase {
  execute(
    restaurantId: string,
    userId: string,
    dto: CreateMenuCategoryDto,
  ): Promise<MenuCategoryResponseDto>;
}
