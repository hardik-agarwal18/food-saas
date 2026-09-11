import { MenuModifierGroup } from '../entities/menu-modifier-group.entity.js';
import { MenuModifierItem } from '../entities/menu-modifier-item.entity.js';

export interface IMenuModifierRepository {
  saveGroup(group: MenuModifierGroup): Promise<void>;
  updateGroup(group: MenuModifierGroup): Promise<void>;
  findGroupById(id: string): Promise<MenuModifierGroup | null>;
  findGroupsByRestaurantId(restaurantId: string): Promise<MenuModifierGroup[]>;
  findGroupsByMenuItemId(menuItemId: string): Promise<MenuModifierGroup[]>;

  saveItem(item: MenuModifierItem): Promise<void>;
  updateItem(item: MenuModifierItem): Promise<void>;
  findItemById(id: string): Promise<MenuModifierItem | null>;
  findItemsByGroupId(groupId: string): Promise<MenuModifierItem[]>;
}
