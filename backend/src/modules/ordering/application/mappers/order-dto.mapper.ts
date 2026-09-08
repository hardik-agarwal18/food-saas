import { Order } from '../../domain/entities/order.entity.js';
import { OrderItem } from '../../domain/entities/order-item.entity.js';
import { OrderItemModifier } from '../../domain/entities/order-item-modifier.entity.js';
import {
  OrderResponseDto,
  OrderItemResponseDto,
  OrderItemModifierResponseDto,
} from '../dto/order.dto.js';

export class OrderDtoMapper {
  static modifierToResponse(domain: OrderItemModifier): OrderItemModifierResponseDto {
    return {
      id: domain.getId(),
      menuModifierItemId: domain.getMenuModifierItemId(),
      name: domain.getName(),
      priceAdjustment: domain.getPrice().getValue(),
    };
  }

  static itemToResponse(domain: OrderItem): OrderItemResponseDto {
    return {
      id: domain.getId(),
      menuItemId: domain.getMenuItemId(),
      name: domain.getName(),
      unitPrice: domain.getUnitPrice().getValue(),
      quantity: domain.getQuantity(),
      totalPrice: domain.getTotalPrice().getValue(),
      specialInstructions: domain.getSpecialInstructions(),
      modifiers: domain.getModifiers().map(OrderDtoMapper.modifierToResponse),
    };
  }

  static toResponse(domain: Order): OrderResponseDto {
    return {
      id: domain.getId(),
      customerId: domain.getCustomerId(),
      restaurantId: domain.getRestaurantId(),
      restaurantName: domain.getRestaurantName(),
      status: domain.getStatus(),
      paymentStatus: domain.getPaymentStatus(),
      orderType: domain.getOrderType(),

      subtotal: domain.getSubtotal().getValue(),
      deliveryFee: domain.getDeliveryFee().getValue(),
      taxAmount: domain.getTaxAmount().getValue(),
      discountAmount: domain.getDiscountAmount().getValue(),
      totalAmount: domain.getTotalAmount().getValue(),

      deliveryAddress: domain.getDeliveryAddress(),
      specialInstructions: domain.getSpecialInstructions(),

      acceptedAt: domain.getAcceptedAt(),
      preparingAt: domain.getPreparingAt(),
      readyAt: domain.getReadyAt(),
      deliveredAt: domain.getDeliveredAt(),
      cancelledAt: domain.getCancelledAt(),

      createdAt: domain.getCreatedAt(),
      updatedAt: domain.getUpdatedAt(),

      items: domain.getItems().map(OrderDtoMapper.itemToResponse),
    };
  }
}
