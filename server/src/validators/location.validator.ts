import { z } from 'zod';

// Update location schema
export const updateLocationSchema = z.object({
  body: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().min(0).optional()
  })
});

export type UpdateLocationInput = z.infer<typeof updateLocationSchema>['body'];
