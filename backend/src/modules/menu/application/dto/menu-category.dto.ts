export interface MenuCategoryResponseDto {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMenuCategoryDto {
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateMenuCategoryDto {
  name?: string;
  description?: string;
  sortOrder?: number;
}
