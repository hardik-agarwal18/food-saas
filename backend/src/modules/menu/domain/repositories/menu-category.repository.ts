import { MenuCategory } from '../entities/menu-category.entity.js';

export interface IMenuCategoryRepository {
  save(category: MenuCategory): Promise<void>;
  update(category: MenuCategory): Promise<void>;
  findById(id: string): Promise<MenuCategory | null>;
  findByRestaurantId(restaurantId: string): Promise<MenuCategory[]>;
}
