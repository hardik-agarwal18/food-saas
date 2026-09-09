import { z } from 'zod';

export const createMenuCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateMenuCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const createMenuItemSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(1000).optional(),
  price: z.number().min(0, 'Price cannot be negative'),
  sortOrder: z.number().int().min(0).optional(),
  dietaryPreference: z.enum(['VEG', 'NON_VEG', 'VEGAN']).optional(),
  modifierGroupIds: z.array(z.string().uuid()).optional(),
});

export const createMenuModifierGroupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  isRequired: z.boolean(),
  minSelections: z.number().int().min(0),
  maxSelections: z.number().int().min(0).optional(),
});

export const createMenuModifierItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  priceAdjustment: z.number(),
  sortOrder: z.number().int().min(0).optional(),
});
