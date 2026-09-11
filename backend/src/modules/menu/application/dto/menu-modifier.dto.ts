export interface MenuModifierItemResponseDto {
  id: string;
  modifierGroupId: string;
  name: string;
  priceAdjustment: number;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuModifierGroupResponseDto {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMenuModifierGroupDto {
  name: string;
  description?: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections?: number;
}

export interface CreateMenuModifierItemDto {
  name: string;
  priceAdjustment: number;
  sortOrder?: number;
}
