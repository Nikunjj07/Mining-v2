import { z } from 'zod';

// Mark notification as read schema
export const markAsReadSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid notification ID')
  })
});

// Get notifications query schema
export const getNotificationsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(20).optional(),
    read: z.enum(['true', 'false']).optional()
  })
});

export type MarkAsReadParams = z.infer<typeof markAsReadSchema>['params'];
export type GetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>['query'];
