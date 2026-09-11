import { OrderStatus, PaymentStatus, OrderType } from '../../../../generated/prisma/client.js';

export type PlaceOrderItemModifierDto = {
  menuModifierItemId: string;
};

export type PlaceOrderItemDto = {
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
  modifierItemIds?: string[];
};

export type PlaceOrderDto = {
  restaurantId: string;
  orderType: OrderType;
  deliveryAddress?: Record<string, any>;
  specialInstructions?: string;
  items: PlaceOrderItemDto[];
};

export type OrderItemModifierResponseDto = {
  id: string;
  menuModifierItemId: string;
  name: string;
  priceAdjustment: number;
};

export type OrderItemResponseDto = {
  id: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  specialInstructions: string | null;
  modifiers: OrderItemModifierResponseDto[];
};

export type OrderResponseDto = {
  id: string;
  customerId: string;
  restaurantId: string;
  restaurantName: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderType: OrderType;

  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;

  deliveryAddress: Record<string, any> | null;
  specialInstructions: string | null;

  acceptedAt: Date | null;
  preparingAt: Date | null;
  readyAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  items: OrderItemResponseDto[];
};
