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
  modifierGroupIds?: string[];
}

export interface UpdateMenuItemDto {
  categoryId?: string | null; // explicit null to unset
  name?: string;
  description?: string;
  price?: number;
  sortOrder?: number;
  modifierGroupIds?: string[]; // to completely replace
}
