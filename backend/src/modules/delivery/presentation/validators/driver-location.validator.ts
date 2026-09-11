import { z } from 'zod';

export const driverLocationPayloadSchema = z.strictObject({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  timestamp: z.number().int().positive(),
});

export type DriverLocationPayload = z.infer<typeof driverLocationPayloadSchema>;
