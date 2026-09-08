import { Prisma } from '../../../../../../generated/prisma/client.js';
import { MenuItem } from '../../../../domain/entities/menu-item.entity.js';
import { Money } from '../../../../domain/value-objects/money.vo.js';

type PrismaMenuItemWithRelations = Prisma.MenuItemGetPayload<{
  include: { modifierGroups: true };
}>;

export class MenuItemMapper {
  static toDomain(raw: PrismaMenuItemWithRelations): MenuItem {
    const modifierGroupIds = raw.modifierGroups
      ? raw.modifierGroups.map((mg) => mg.modifierGroupId)
      : [];

    return MenuItem.rehydrate({
      id: raw.id,
      restaurantId: raw.restaurantId,
      categoryId: raw.categoryId,
      name: raw.name,
      description: raw.description,
      price: Money.fromNumber(Number(raw.price)),
      imageUrl: raw.imageUrl,
      isAvailable: raw.isAvailable,
      sortOrder: raw.sortOrder,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      modifierGroupIds,
    });
  }

  static toCreateInput(domain: MenuItem): Prisma.MenuItemCreateInput {
    return {
      id: domain.getId(),
      restaurant: { connect: { id: domain.getRestaurantId() } },
      category: domain.getCategoryId() ? { connect: { id: domain.getCategoryId()! } } : undefined,
      name: domain.getName(),
      description: domain.getDescription(),
      price: domain.getPrice().getValue(),
      imageUrl: domain.getImageUrl(),
      isAvailable: domain.getIsAvailable(),
      sortOrder: domain.getSortOrder(),
      createdAt: domain.getCreatedAt(),
      updatedAt: domain.getUpdatedAt(),
      deletedAt: domain.getDeletedAt() ?? undefined,
      modifierGroups: {
        create: domain.getModifierGroupIds().map((groupId) => ({
          modifierGroup: { connect: { id: groupId } },
        })),
      },
    };
  }

  static toUpdateInput(domain: MenuItem): Prisma.MenuItemUpdateInput {
    return {
      category: domain.getCategoryId()
        ? { connect: { id: domain.getCategoryId()! } }
        : { disconnect: true },
      name: domain.getName(),
      description: domain.getDescription(),
      price: domain.getPrice().getValue(),
      imageUrl: domain.getImageUrl(),
      isAvailable: domain.getIsAvailable(),
      sortOrder: domain.getSortOrder(),
      updatedAt: domain.getUpdatedAt(),
      deletedAt: domain.getDeletedAt() ?? undefined,
      modifierGroups: {
        deleteMany: {},
        create: domain.getModifierGroupIds().map((groupId) => ({
          modifierGroup: { connect: { id: groupId } },
        })),
      },
    };
  }
}
