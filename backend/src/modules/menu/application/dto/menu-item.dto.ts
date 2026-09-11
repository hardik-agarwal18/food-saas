import { DietaryPreference } from '../../domain/entities/menu-item.entity.js';

export interface MenuItemResponseDto {
  id: string;
  restaurantId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
  dietaryPreference: DietaryPreference;
  modifierGroupIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMenuItemDto {
  categoryId?: string;
  name: string;
  description?: string;
  price: number;
  sortOrder?: number;
  dietaryPreference: DietaryPreference;
  modifierGroupIds?: string[];
}

export interface UpdateMenuItemDto {
  categoryId?: string | null; // explicit null to unset
  name?: string;
  description?: string;
  price?: number;
  sortOrder?: number;
  dietaryPreference?: DietaryPreference;
  modifierGroupIds?: string[]; // to completely replace
}
