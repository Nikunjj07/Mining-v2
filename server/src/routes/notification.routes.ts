import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  getNotificationsQuerySchema,
  markAsReadSchema
} from '../validators/notification.validator.js';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Get notifications for current user
router.get(
  '/',
  validate(getNotificationsQuerySchema),
  getNotifications
);

// Get unread notification count
router.get(
  '/unread-count',
  getUnreadCount
);

// Mark all notifications as read
router.patch(
  '/read-all',
  markAllAsRead
);

// Mark specific notification as read
router.patch(
  '/:id/read',
  validate(markAsReadSchema),
  markAsRead
);

export default router;
