import { z } from 'zod';

export const registerDriverSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  vehicleType: z.enum(['BICYCLE', 'MOTORCYCLE', 'CAR', 'VAN']),
  vehiclePlateNumber: z.string().optional(),
});

export const toggleDriverAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});

export const updateDeliveryStatusSchema = z.object({
  status: z.enum(['PICKED_UP', 'DELIVERED']),
});
