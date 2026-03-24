import { z } from 'zod';

// Create shift log schema
export const createShiftLogSchema = z.object({
  body: z.object({
    shift: z.enum(['morning', 'evening', 'night'], {
      errorMap: () => ({ message: 'Shift must be morning, evening, or night' })
    }),
    production_summary: z.string().optional(),
    equipment_status: z.string().optional(),
    safety_issues: z.string().optional(),
    red_flag: z.boolean().default(false),
    next_shift_instructions: z.string().optional()
  })
});

// Acknowledge shift schema
export const acknowledgeShiftSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid shift log ID')
  })
});

// Get shifts query schema
export const getShiftsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(20).optional(),
    acknowledged: z.enum(['true', 'false']).optional()
  })
});

// Get recent shifts query schema
export const getRecentShiftsQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().min(1).max(50).default(10).optional()
  })
});

export type CreateShiftLogInput = z.infer<typeof createShiftLogSchema>['body'];
export type AcknowledgeShiftParams = z.infer<typeof acknowledgeShiftSchema>['params'];
export type GetShiftsQuery = z.infer<typeof getShiftsQuerySchema>['query'];
export type GetRecentShiftsQuery = z.infer<typeof getRecentShiftsQuerySchema>['query'];
