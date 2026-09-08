import { z } from 'zod';

export const updateRestaurantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  description: z.string().max(500).optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164 expected)')
    .optional(),
  email: z.string().email('Invalid email address').optional(),
  address: z
    .object({
      streetAddress: z.string().min(5),
      city: z.string().min(2),
      state: z.string().min(2),
      zipCode: z.string().min(4),
      country: z.string().min(2),
    })
    .optional(),
});
