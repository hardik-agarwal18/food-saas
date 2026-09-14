import { z } from 'zod';
import { extractedMenuDataSchema } from '../../shared/schemas/extracted-menu.schema.js';

export const confirmMenuImportSchema = z.object({
  body: z.object({
    editedData: extractedMenuDataSchema.optional(),
  }),
});
