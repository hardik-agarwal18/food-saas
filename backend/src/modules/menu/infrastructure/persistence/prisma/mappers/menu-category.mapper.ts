import { Prisma } from '../../../../../../generated/prisma/client.js';
import { MenuCategory } from '../../../../domain/entities/menu-category.entity.js';

export class MenuCategoryMapper {
  static toDomain(raw: Prisma.MenuCategoryGetPayload<{}>): MenuCategory {
    return MenuCategory.rehydrate({
      id: raw.id,
      restaurantId: raw.restaurantId,
      name: raw.name,
      description: raw.description,
      sortOrder: raw.sortOrder,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toCreateInput(domain: MenuCategory): Prisma.MenuCategoryCreateInput {
    return {
      id: domain.getId(),
      restaurant: { connect: { id: domain.getRestaurantId() } },
      name: domain.getName(),
      description: domain.getDescription(),
      sortOrder: domain.getSortOrder(),
      isActive: domain.getIsActive(),
      createdAt: domain.getCreatedAt(),
      updatedAt: domain.getUpdatedAt(),
      deletedAt: domain.getDeletedAt() ?? undefined,
    };
  }

  static toUpdateInput(domain: MenuCategory): Prisma.MenuCategoryUpdateInput {
    return {
      name: domain.getName(),
      description: domain.getDescription(),
      sortOrder: domain.getSortOrder(),
      isActive: domain.getIsActive(),
      updatedAt: domain.getUpdatedAt(),
      deletedAt: domain.getDeletedAt() ?? undefined,
    };
  }
}
