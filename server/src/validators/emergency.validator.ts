import { z } from 'zod';

// Create emergency schema
export const createEmergencySchema = z.object({
  body: z.object({
    type: z.enum([
      'gas_leak',
      'fire',
      'collapse',
      'equipment_failure',
      'worker_trapped',
      'ventilation_failure'
    ], {
      errorMap: () => ({ message: 'Invalid emergency type' })
    }),
    severity: z.enum(['low', 'medium', 'high'], {
      errorMap: () => ({ message: 'Severity must be low, medium, or high' })
    }),
    location: z.string().optional(),
    description: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional()
  })
});

// Update emergency status schema
export const updateEmergencyStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid emergency ID')
  }),
  body: z.object({
    status: z.enum(['active', 'in_progress', 'resolved'], {
      errorMap: () => ({ message: 'Status must be active, in_progress, or resolved' })
    })
  })
});

// Assign rescue team schema
export const assignRescueTeamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid emergency ID')
  }),
  body: z.object({
    assigned_to: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')
  })
});

// Get emergencies query schema
export const getEmergenciesQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(20).optional(),
    severity: z.enum(['low', 'medium', 'high']).optional(),
    status: z.enum(['active', 'in_progress', 'resolved']).optional()
  })
});

export type CreateEmergencyInput = z.infer<typeof createEmergencySchema>['body'];
export type UpdateEmergencyStatusInput = z.infer<typeof updateEmergencyStatusSchema>;
export type AssignRescueTeamInput = z.infer<typeof assignRescueTeamSchema>;
export type GetEmergenciesQuery = z.infer<typeof getEmergenciesQuerySchema>['query'];
