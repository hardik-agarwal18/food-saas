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

export const updateDriverLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const getNearbyDriversSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(0.1).max(50).default(5), // Default 5km
});
