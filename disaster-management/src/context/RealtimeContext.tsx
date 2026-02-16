import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { getUnreadCount, type Notification } from '../services/notification.service';

interface RealtimeContextType {
    unreadCount: number;
    refreshNotifications: () => Promise<void>;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const useRealtime = () => {
    const context = useContext(RealtimeContext);
    if (!context) {
        throw new Error('useRealtime must be used within RealtimeProvider');
    }
    return context;
};

interface RealtimeProviderProps {
    children: ReactNode;
}

export const RealtimeProvider = ({ children }: RealtimeProviderProps) => {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const refreshNotifications = async () => {
        if (!user?.id) return;

        try {
            const count = await getUnreadCount(user.id);
            setUnreadCount(count);
        } catch (error) {
            console.error('Error refreshing notifications:', error);
        }
    };

    useEffect(() => {
        if (!user?.id) return;

        // Initial fetch
        refreshNotifications();

        // Subscribe to notifications table changes
        const notificationChannel = supabase
            .channel('notifications-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    console.log('Notification change:', payload);
                    refreshNotifications();

                    // Show toast for new notifications
                    if (payload.eventType === 'INSERT') {
                        const newNotification = payload.new as Notification;
                        showToast(newNotification);
                    }
                }
            )
            .subscribe();

        // Subscribe to emergencies table for real-time updates
        const emergencyChannel = supabase
            .channel('emergencies-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'emergencies'
                },
                (payload) => {
                    console.log('Emergency change:', payload);
                    // Notifications will be created by triggers/edge functions
                }
            )
            .subscribe();

        // Subscribe to shift_logs table
        const shiftChannel = supabase
            .channel('shift-logs-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'shift_logs'
                },
                (payload) => {
                    console.log('Shift log change:', payload);
                    // Notifications will be created by triggers/edge functions
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(notificationChannel);
            supabase.removeChannel(emergencyChannel);
            supabase.removeChannel(shiftChannel);
        };
    }, [user?.id]);

    const showToast = (notification: Notification) => {
        // Create custom event for toast notifications
        const event = new CustomEvent('show-notification-toast', {
            detail: notification
        });
        window.dispatchEvent(event);
    };

    return (
        <RealtimeContext.Provider value={{ unreadCount, refreshNotifications }}>
            {children}
        </RealtimeContext.Provider>
    );
};
