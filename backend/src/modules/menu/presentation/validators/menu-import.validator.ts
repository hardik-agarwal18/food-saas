import { z } from 'zod';

export const confirmMenuImportSchema = z.object({
  body: z.object({
    editedData: z.any().optional(), // Could be more strongly typed later
  }),
});
