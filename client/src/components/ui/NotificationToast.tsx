import { useEffect, useState } from 'react';
import type { Notification } from '../../services/notification.service';

export default function NotificationToast() {
    const [toast, setToast] = useState<Notification | null>(null);

    useEffect(() => {
        const handleShowToast = (event: Event) => {
            const customEvent = event as CustomEvent<Notification>;
            setToast(customEvent.detail);

            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                setToast(null);
            }, 5000);
        };

        window.addEventListener('show-notification-toast', handleShowToast);

        return () => {
            window.removeEventListener('show-notification-toast', handleShowToast);
        };
    }, []);

    if (!toast) return null;

    const getToastColor = () => {
        switch (toast.type) {
            case 'emergency_created':
            case 'emergency_status_changed':
                return 'bg-destructive/90 border-destructive';
            case 'emergency_assigned':
                return 'bg-primary/90 border-primary';
            case 'shift_acknowledgment_required':
                return 'bg-yellow-500/90 border-yellow-500';
            default:
                return 'bg-card border-border';
        }
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'emergency_created':
            case 'emergency_status_changed':
                return '🚨';
            case 'emergency_assigned':
                return '👷';
            case 'shift_acknowledgment_required':
                return '📋';
            default:
                return '🔔';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-5">
            <div className={`${getToastColor()} border-2 text-white rounded-lg shadow-2xl p-4 max-w-md`}>
                <div className="flex items-start gap-3">
                    <span className="text-2xl">{getIcon()}</span>
                    <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{toast.title}</h4>
                        <p className="text-sm opacity-90">{toast.message}</p>
                    </div>
                    <button
                        onClick={() => setToast(null)}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
