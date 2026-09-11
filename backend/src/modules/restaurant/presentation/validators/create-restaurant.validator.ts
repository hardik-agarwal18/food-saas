import { z } from 'zod';

export const createRestaurantSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().max(2000).optional(),
  phoneNumber: z.string(),
  email: z.string().email(),
  address: z.object({
    streetAddress: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
  }),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});
