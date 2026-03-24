import { z } from 'zod';

// Create hazard schema
export const createHazardSchema = z.object({
  body: z.object({
    hazard_name: z.string().min(1, 'Hazard name is required'),
    description: z.string().optional(),
    risk_level: z.enum(['low', 'medium', 'high'], {
      errorMap: () => ({ message: 'Risk level must be low, medium, or high' })
    }),
    control_measure: z.string().optional(),
    responsible_person: z.string().optional(),
    review_date: z.string().datetime().optional(),
    status: z.string().default('active')
  })
});

// Update hazard schema
export const updateHazardSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid hazard ID')
  }),
  body: z.object({
    hazard_name: z.string().min(1).optional(),
    description: z.string().optional(),
    risk_level: z.enum(['low', 'medium', 'high']).optional(),
    control_measure: z.string().optional(),
    responsible_person: z.string().optional(),
    review_date: z.string().datetime().optional(),
    status: z.string().optional()
  })
});

// Get hazard by ID schema
export const getHazardByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid hazard ID')
  })
});

// Delete hazard schema
export const deleteHazardSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid hazard ID')
  })
});

// Get hazards query schema
export const getHazardsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(20).optional(),
    risk_level: z.enum(['low', 'medium', 'high']).optional(),
    status: z.string().optional()
  })
});

export type CreateHazardInput = z.infer<typeof createHazardSchema>['body'];
export type UpdateHazardInput = z.infer<typeof updateHazardSchema>;
export type GetHazardByIdParams = z.infer<typeof getHazardByIdSchema>['params'];
export type DeleteHazardParams = z.infer<typeof deleteHazardSchema>['params'];
export type GetHazardsQuery = z.infer<typeof getHazardsQuerySchema>['query'];
