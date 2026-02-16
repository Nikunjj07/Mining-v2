// Notification service for managing in-app notifications
import { supabase } from '../lib/supabase';

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

export const getNotifications = async (userId: string): Promise<Notification[]> => {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) throw error;
    return data || [];
};

export const getUnreadCount = async (userId: string): Promise<number> => {
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

    if (error) throw error;
    return count || 0;
};

export const markAsRead = async (notificationId: string): Promise<void> => {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

    if (error) throw error;
};

export const markAllAsRead = async (userId: string): Promise<void> => {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

    if (error) throw error;
};

export const createNotification = async (
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    relatedId?: string,
    relatedTable?: string
): Promise<void> => {
    const { error } = await supabase
        .from('notifications')
        .insert([{
            user_id: userId,
            type,
            title,
            message,
            related_id: relatedId,
            related_table: relatedTable
        }]);

    if (error) throw error;
};
