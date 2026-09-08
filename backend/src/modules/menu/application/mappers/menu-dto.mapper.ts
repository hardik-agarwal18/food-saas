import { MenuCategoryResponseDto } from '../dto/menu-category.dto.js';
import { MenuCategory } from '../../domain/entities/menu-category.entity.js';
import { MenuItemResponseDto } from '../dto/menu-item.dto.js';
import { MenuItem } from '../../domain/entities/menu-item.entity.js';
import {
  MenuModifierGroupResponseDto,
  MenuModifierItemResponseDto,
} from '../dto/menu-modifier.dto.js';
import { MenuModifierGroup } from '../../domain/entities/menu-modifier-group.entity.js';
import { MenuModifierItem } from '../../domain/entities/menu-modifier-item.entity.js';

export class MenuDtoMapper {
  static categoryToResponse(domain: MenuCategory): MenuCategoryResponseDto {
    return {
      id: domain.getId(),
      restaurantId: domain.getRestaurantId(),
      name: domain.getName(),
      description: domain.getDescription(),
      sortOrder: domain.getSortOrder(),
      isActive: domain.getIsActive(),
      createdAt: domain.getCreatedAt(),
      updatedAt: domain.getUpdatedAt(),
    };
  }

  static itemToResponse(domain: MenuItem): MenuItemResponseDto {
    return {
      id: domain.getId(),
      restaurantId: domain.getRestaurantId(),
      categoryId: domain.getCategoryId(),
      name: domain.getName(),
      description: domain.getDescription(),
      price: domain.getPrice().getValue(),
      imageUrl: domain.getImageUrl(),
      isAvailable: domain.getIsAvailable(),
      sortOrder: domain.getSortOrder(),
      modifierGroupIds: domain.getModifierGroupIds(),
      createdAt: domain.getCreatedAt(),
      updatedAt: domain.getUpdatedAt(),
    };
  }

  static modifierGroupToResponse(domain: MenuModifierGroup): MenuModifierGroupResponseDto {
    return {
      id: domain.getId(),
      restaurantId: domain.getRestaurantId(),
      name: domain.getName(),
      description: domain.getDescription(),
      isRequired: domain.getIsRequired(),
      minSelections: domain.getMinSelections(),
      maxSelections: domain.getMaxSelections(),
      createdAt: domain.getCreatedAt(),
      updatedAt: domain.getUpdatedAt(),
    };
  }

  static modifierItemToResponse(domain: MenuModifierItem): MenuModifierItemResponseDto {
    return {
      id: domain.getId(),
      modifierGroupId: domain.getModifierGroupId(),
      name: domain.getName(),
      priceAdjustment: domain.getPriceAdjustment().getValue(),
      isAvailable: domain.getIsAvailable(),
      sortOrder: domain.getSortOrder(),
      createdAt: domain.getCreatedAt(),
      updatedAt: domain.getUpdatedAt(),
    };
  }
}
