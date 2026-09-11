import { Prisma } from '../../../../../../generated/prisma/client.js';
import { MenuModifierGroup } from '../../../../domain/entities/menu-modifier-group.entity.js';
import { MenuModifierItem } from '../../../../domain/entities/menu-modifier-item.entity.js';
import { Money } from '../../../../domain/value-objects/money.vo.js';

export class MenuModifierMapper {
  static groupToDomain(raw: Prisma.MenuModifierGroupGetPayload<{}>): MenuModifierGroup {
    return MenuModifierGroup.rehydrate({
      id: raw.id,
      restaurantId: raw.restaurantId,
      name: raw.name,
      description: raw.description,
      isRequired: raw.isRequired,
      minSelections: raw.minSelections,
      maxSelections: raw.maxSelections,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static groupToCreateInput(domain: MenuModifierGroup): Prisma.MenuModifierGroupCreateInput {
    return {
      id: domain.getId(),
      restaurant: { connect: { id: domain.getRestaurantId() } },
      name: domain.getName(),
      description: domain.getDescription(),
      isRequired: domain.getIsRequired(),
      minSelections: domain.getMinSelections(),
      maxSelections: domain.getMaxSelections(),
      createdAt: domain.getCreatedAt(),
      updatedAt: domain.getUpdatedAt(),
      deletedAt: domain.getDeletedAt() ?? undefined,
    };
  }

  static groupToUpdateInput(domain: MenuModifierGroup): Prisma.MenuModifierGroupUpdateInput {
    return {
      name: domain.getName(),
      description: domain.getDescription(),
      isRequired: domain.getIsRequired(),
      minSelections: domain.getMinSelections(),
      maxSelections: domain.getMaxSelections(),
      updatedAt: domain.getUpdatedAt(),
      deletedAt: domain.getDeletedAt() ?? undefined,
    };
  }

  static itemToDomain(raw: Prisma.MenuModifierItemGetPayload<{}>): MenuModifierItem {
    return MenuModifierItem.rehydrate({
      id: raw.id,
      modifierGroupId: raw.modifierGroupId,
      name: raw.name,
      priceAdjustment: Money.fromNumber(Number(raw.priceAdjustment)),
      isAvailable: raw.isAvailable,
      sortOrder: raw.sortOrder,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static itemToCreateInput(domain: MenuModifierItem): Prisma.MenuModifierItemCreateInput {
    return {
      id: domain.getId(),
      modifierGroup: { connect: { id: domain.getModifierGroupId() } },
      name: domain.getName(),
      priceAdjustment: domain.getPriceAdjustment().getValue(),
      isAvailable: domain.getIsAvailable(),
      sortOrder: domain.getSortOrder(),
      createdAt: domain.getCreatedAt(),
      updatedAt: domain.getUpdatedAt(),
      deletedAt: domain.getDeletedAt() ?? undefined,
    };
  }

  static itemToUpdateInput(domain: MenuModifierItem): Prisma.MenuModifierItemUpdateInput {
    return {
      name: domain.getName(),
      priceAdjustment: domain.getPriceAdjustment().getValue(),
      isAvailable: domain.getIsAvailable(),
      sortOrder: domain.getSortOrder(),
      updatedAt: domain.getUpdatedAt(),
      deletedAt: domain.getDeletedAt() ?? undefined,
    };
  }
}
