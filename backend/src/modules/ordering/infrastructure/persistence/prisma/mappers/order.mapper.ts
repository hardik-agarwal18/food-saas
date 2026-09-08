import { Order } from '../../../../domain/entities/order.entity.js';
import { OrderItem } from '../../../../domain/entities/order-item.entity.js';
import { OrderItemModifier } from '../../../../domain/entities/order-item-modifier.entity.js';
import { Money } from '../../../../../menu/domain/value-objects/money.vo.js';
import { Prisma } from '../../../../../../generated/prisma/client.js';

type PrismaOrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        modifiers: true;
      };
    };
  };
}>;

export class OrderMapper {
  static modifierToDomain(raw: Prisma.OrderItemModifierGetPayload<{}>): OrderItemModifier {
    return OrderItemModifier.rehydrate({
      id: raw.id,
      orderItemId: raw.orderItemId,
      menuModifierItemId: raw.menuModifierItemId,
      name: raw.name,
      price: Money.fromNumber(raw.price.toNumber()),
    });
  }

  static itemToDomain(
    raw: Prisma.OrderItemGetPayload<{ include: { modifiers: true } }>,
  ): OrderItem {
    return OrderItem.rehydrate({
      id: raw.id,
      orderId: raw.orderId,
      menuItemId: raw.menuItemId,
      name: raw.name,
      unitPrice: Money.fromNumber(raw.unitPrice.toNumber()),
      quantity: raw.quantity,
      specialInstructions: raw.specialInstructions,
      modifiers: raw.modifiers.map(OrderMapper.modifierToDomain),
    });
  }

  static toDomain(raw: PrismaOrderWithRelations): Order {
    return Order.rehydrate({
      id: raw.id,
      customerId: raw.customerId,
      restaurantId: raw.restaurantId,
      restaurantName: raw.restaurantName,
      status: raw.status,
      paymentStatus: raw.paymentStatus,
      orderType: raw.orderType,

      subtotal: Money.fromNumber(raw.subtotal.toNumber()),
      deliveryFee: Money.fromNumber(raw.deliveryFee.toNumber()),
      taxAmount: Money.fromNumber(raw.taxAmount.toNumber()),
      discountAmount: Money.fromNumber(raw.discountAmount.toNumber()),
      totalAmount: Money.fromNumber(raw.totalAmount.toNumber()),

      deliveryAddress: raw.deliveryAddress as Record<string, any> | null,
      specialInstructions: raw.specialInstructions,

      acceptedAt: raw.acceptedAt,
      preparingAt: raw.preparingAt,
      readyAt: raw.readyAt,
      deliveredAt: raw.deliveredAt,
      cancelledAt: raw.cancelledAt,

      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,

      items: raw.items.map(OrderMapper.itemToDomain),
    });
  }

  static toCreateInput(domain: Order): Prisma.OrderCreateInput {
    return {
      id: domain.getId(),
      status: domain.getStatus(),
      paymentStatus: domain.getPaymentStatus(),
      orderType: domain.getOrderType(),

      subtotal: domain.getSubtotal().getValue(),
      deliveryFee: domain.getDeliveryFee().getValue(),
      taxAmount: domain.getTaxAmount().getValue(),
      discountAmount: domain.getDiscountAmount().getValue(),
      totalAmount: domain.getTotalAmount().getValue(),

      restaurantName: domain.getRestaurantName(),
      deliveryAddress: domain.getDeliveryAddress() ?? Prisma.JsonNull,
      specialInstructions: domain.getSpecialInstructions(),

      acceptedAt: domain.getAcceptedAt(),
      preparingAt: domain.getPreparingAt(),
      readyAt: domain.getReadyAt(),
      deliveredAt: domain.getDeliveredAt(),
      cancelledAt: domain.getCancelledAt(),

      createdAt: domain.getCreatedAt(),
      updatedAt: domain.getUpdatedAt(),

      customer: { connect: { id: domain.getCustomerId() } },
      restaurant: { connect: { id: domain.getRestaurantId() } },

      items: {
        create: domain.getItems().map((item) => ({
          id: item.getId(),
          menuItem: { connect: { id: item.getMenuItemId() } },
          name: item.getName(),
          unitPrice: item.getUnitPrice().getValue(),
          quantity: item.getQuantity(),
          specialInstructions: item.getSpecialInstructions(),
          modifiers: {
            create: item.getModifiers().map((mod) => ({
              id: mod.getId(),
              menuModifierItem: { connect: { id: mod.getMenuModifierItemId() } },
              name: mod.getName(),
              price: mod.getPrice().getValue(),
            })),
          },
        })),
      },
    };
  }
}
