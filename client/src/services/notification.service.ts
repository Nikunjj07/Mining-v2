// Notification service - REST API implementation
import apiClient from './api.client';

export interface Notification {
    id: string;
    user_id: string;
    type: 'emergency_created' | 'emergency_assigned' | 'emergency_status_changed' | 'shift_acknowledgment_required';
    title: string;
    message: string;
    related_id?: string;
    related_table?: string;
    read: boolean;
    created_at: string;
}

export const getNotifications = async (params?: {
    page?: number;
    limit?: number;
} | string): Promise<Notification[]> => {
    const normalizedParams = typeof params === 'string' ? undefined : params;
    const response = await apiClient.get('/notifications', { params: normalizedParams });
    return response.data.notifications;
};

export const getUnreadCount = async (): Promise<number> => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.count;
};

export const markAsRead = async (notificationId: string): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/read`);
};

export const markAllAsRead = async (_userId?: string): Promise<void> => {
    await apiClient.patch('/notifications/mark-all-read');
};
