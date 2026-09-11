import { z } from 'zod';
import { OrderType, OrderStatus } from '../../../../generated/prisma/client.js';

const placeOrderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().positive(),
  specialInstructions: z.string().max(500).optional(),
  modifierItemIds: z.array(z.string().uuid()).optional(),
});

export const placeOrderSchema = z.object({
  restaurantId: z.string().uuid(),
  orderType: z.nativeEnum(OrderType),
  deliveryAddress: z.record(z.string(), z.any()).optional(),
  specialInstructions: z.string().max(500).optional(),
  items: z.array(placeOrderItemSchema).min(1, 'Order must contain at least one item'),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export const paginationQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => Number(val))
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => Number(val))
    .optional(),
});
