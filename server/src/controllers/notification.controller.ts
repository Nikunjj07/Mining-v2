import { type Request, type Response } from 'express';
import { Notification } from '../models/Notification.model.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import type { GetNotificationsQuery, MarkAsReadParams } from '../validators/notification.validator.js';

// Get notifications for current user
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Unauthorized', 401);
  }

  const { page = 1, limit = 20, read } = req.query as unknown as GetNotificationsQuery;

  const filter: any = { user_id: req.user.userId };
  if (read !== undefined) {
    filter.read = read === 'true';
  }

  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filter)
  ]);

  res.json({
    notifications,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get unread notification count
export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Unauthorized', 401);
  }

  const count = await Notification.countDocuments({
    user_id: req.user.userId,
    read: false
  });

  res.json({ count });
});

// Mark notification as read
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Unauthorized', 401);
  }

  const { id } = req.params as MarkAsReadParams;

  const notification = await Notification.findOne({
    _id: id,
    user_id: req.user.userId
  });

  if (!notification) {
    throw createError('Notification not found', 404);
  }

  if (notification.read) {
    res.json({
      message: 'Notification already marked as read',
      notification
    });
    return;
  }

  notification.read = true;
  await notification.save();

  res.json({
    message: 'Notification marked as read',
    notification
  });
});

// Mark all notifications as read
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Unauthorized', 401);
  }

  const result = await Notification.updateMany(
    { user_id: req.user.userId, read: false },
    { $set: { read: true } }
  );

  res.json({
    message: 'All notifications marked as read',
    count: result.modifiedCount
  });
});
