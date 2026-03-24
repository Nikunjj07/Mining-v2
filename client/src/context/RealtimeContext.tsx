import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getUnreadCount, getNotifications, type Notification } from '../services/notification.service';

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

// Polling interval in milliseconds (30 seconds)
const POLL_INTERVAL = 30000;

export const RealtimeProvider = ({ children }: RealtimeProviderProps) => {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const lastNotificationIdRef = useRef<string | null>(null);

    const refreshNotifications = useCallback(async () => {
        if (!user?.id) return;

        try {
            const count = await getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Error refreshing notifications:', error);
        }
    }, [user?.id]);

    const checkForNewNotifications = useCallback(async () => {
        if (!user?.id) return;

        try {
            const notifications = await getNotifications({ limit: 1 });
            if (notifications.length > 0) {
                const latestNotification = notifications[0];

                // Show toast if there's a new notification
                if (lastNotificationIdRef.current &&
                    lastNotificationIdRef.current !== latestNotification.id &&
                    !latestNotification.read) {
                    showToast(latestNotification);
                }

                lastNotificationIdRef.current = latestNotification.id;
            }

            // Always refresh the unread count
            await refreshNotifications();
        } catch (error) {
            console.error('Error checking for new notifications:', error);
        }
    }, [user?.id, refreshNotifications]);

    useEffect(() => {
        if (!user?.id) {
            setUnreadCount(0);
            lastNotificationIdRef.current = null;
            return;
        }

        // Initial fetch
        checkForNewNotifications();

        // Set up polling interval
        const intervalId = setInterval(checkForNewNotifications, POLL_INTERVAL);

        return () => {
            clearInterval(intervalId);
        };
    }, [user?.id, checkForNewNotifications]);

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
