import { z } from 'zod';

export const extractedMenuItemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  price: z.number().min(0),
});

export const extractedMenuCategorySchema = z.object({
  name: z.string().min(1).max(200),
  items: z.array(extractedMenuItemSchema).min(1).max(500),
});

export const extractedMenuDataSchema = z.object({
  categories: z.array(extractedMenuCategorySchema).min(1).max(100),
});
