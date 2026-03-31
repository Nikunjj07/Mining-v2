import { StatusBadge } from './index';

interface EmergencyCardProps {
    emergency: {
        id: string;
        type: 'gas_leak' | 'fire' | 'collapse' | 'equipment_failure' | 'worker_trapped' | 'ventilation_failure';
        severity: 'low' | 'medium' | 'high';
        location: string;
        description: string;
        status: 'active' | 'in_progress' | 'resolved';
        created_at: string;
        resolved_at?: string;
        reporter?: {
            id: string;
            full_name: string;
            email: string;
        };
        assignee?: {
            id: string;
            full_name: string;
            email: string;
        };
    };
    onStatusChange?: (emergencyId: string, newStatus: 'active' | 'in_progress' | 'resolved') => void;
    showStatusChange?: boolean;
    className?: string;
}

export default function EmergencyCard({
    emergency,
    onStatusChange,
    showStatusChange = false,
    className = ''
}: EmergencyCardProps) {
    const getEmergencyTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            gas_leak: 'Gas Leak',
            fire: 'Fire',
            collapse: 'Structural Collapse',
            equipment_failure: 'Equipment Failure',
            worker_trapped: 'Worker Trapped',
            ventilation_failure: 'Ventilation Failure',
        };
        return labels[type] || type;
    };

    const getSeverityVariant = (severity: string): 'danger' | 'warning' | 'success' => {
        switch (severity) {
            case 'high': return 'danger';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'warning';
        }
    };

    const getStatusVariant = (status: string): 'danger' | 'warning' | 'success' => {
        switch (status) {
            case 'active': return 'danger';
            case 'in_progress': return 'warning';
            case 'resolved': return 'success';
            default: return 'warning';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTimeSince = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <div
            className={`bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${emergency.severity === 'high' ? 'border-destructive border-2' : 'border-border'
                } ${className}`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                            {getEmergencyTypeLabel(emergency.type)}
                        </h3>
                        <StatusBadge variant={getSeverityVariant(emergency.severity)}>
                            {emergency.severity.toUpperCase()}
                        </StatusBadge>
                        <StatusBadge variant={getStatusVariant(emergency.status)}>
                            {emergency.status.replace('_', ' ').toUpperCase()}
                        </StatusBadge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {formatDate(emergency.created_at)} • {getTimeSince(emergency.created_at)}
                    </p>
                </div>
            </div>

            {/* Location */}
            <div className="mb-3">
                <h4 className="text-sm font-semibold text-foreground mb-1">Location</h4>
                <p className="text-sm text-muted-foreground">{emergency.location}</p>
            </div>

            {/* Description */}
            <div className="mb-4">
                <h4 className="text-sm font-semibold text-foreground mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">{emergency.description}</p>
            </div>

            {/* Reporter & Assignee */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 pb-4 border-b border-border">
                {emergency.reporter && (
                    <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1">Reported By</h4>
                        <p className="text-sm text-foreground">{emergency.reporter.full_name}</p>
                    </div>
                )}
                {emergency.assignee && (
                    <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1">Assigned To</h4>
                        <p className="text-sm text-foreground">{emergency.assignee.full_name}</p>
                    </div>
                )}
            </div>

            {/* Status Change */}
            {showStatusChange && onStatusChange && (
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-foreground">Update Status:</label>
                    <select
                        value={emergency.status}
                        onChange={(e) => onStatusChange(emergency.id, e.target.value as any)}
                        className="px-3 py-1.5 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                    >
                        <option value="active">Active</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
            )}
        </div>
    );
}
