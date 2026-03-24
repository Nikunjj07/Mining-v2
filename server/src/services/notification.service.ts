import { Notification } from '../models/Notification.model.js';
import type { NotificationType } from '../models/Notification.model.js';

/**
 * Create a notification for a user
 */
export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  relatedId?: string,
  relatedTable?: string
): Promise<void> => {
  try {
    await Notification.create({
      user_id: userId,
      type,
      title,
      message,
      related_id: relatedId,
      related_table: relatedTable,
      read: false
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    // Don't throw - notifications are non-critical
  }
};

/**
 * Create notifications for multiple users
 */
export const createBulkNotifications = async (
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string,
  relatedId?: string,
  relatedTable?: string
): Promise<void> => {
  try {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type,
      title,
      message,
      related_id: relatedId,
      related_table: relatedTable,
      read: false
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Failed to create bulk notifications:', error);
    // Don't throw - notifications are non-critical
  }
};
