import { MenuItem } from '../entities/menu-item.entity.js';

export interface IMenuItemRepository {
  save(item: MenuItem): Promise<void>;
  update(item: MenuItem): Promise<void>;
  findById(id: string): Promise<MenuItem | null>;
  findByRestaurantId(restaurantId: string): Promise<MenuItem[]>;
  findByCategoryId(categoryId: string): Promise<MenuItem[]>;
}
