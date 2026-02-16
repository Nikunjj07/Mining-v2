import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecentShifts, acknowledgeShift } from '../../../services/shift.service';
import { useAuth } from '../../../context/AuthContext';
import { DashboardLayout } from '../../../components/ui';

interface ShiftLog {
    id: string;
    supervisor_id: string;
    shift: 'morning' | 'evening' | 'night';
    production_summary: string;
    equipment_status: string;
    safety_issues: string | null;
    red_flag: boolean;
    next_shift_instructions: string | null;
    acknowledged: boolean;
    created_at: string;
    supervisor?: {
        id: string;
        full_name: string;
        email: string;
    };
}

export default function ShiftHistory() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [shiftLogs, setShiftLogs] = useState<ShiftLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [shiftFilter, setShiftFilter] = useState<'all' | 'morning' | 'evening' | 'night'>('all');

    useEffect(() => {
        fetchShiftLogs();
    }, []);

    const fetchShiftLogs = async () => {
        try {
            setLoading(true);
            const data = await getRecentShifts(20);
            setShiftLogs(data as ShiftLog[]);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch shift logs');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async (shiftLogId: string) => {
        if (!user?.id) {
            setError('You must be logged in to acknowledge shifts');
            return;
        }

        try {
            await acknowledgeShift(shiftLogId, user.id);
            setSuccess('Shift acknowledged successfully!');

            // Update the local state to reflect the acknowledgement
            setShiftLogs(prevLogs =>
                prevLogs.map(log =>
                    log.id === shiftLogId ? { ...log, acknowledged: true } : log
                )
            );

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to acknowledge shift');
            console.error(err);
        }
    };

    // Filter shift logs based on selected shift type
    const filteredShiftLogs = shiftFilter === 'all'
        ? shiftLogs
        : shiftLogs.filter(log => log.shift === shiftFilter);

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

    const getShiftBadgeColor = (shift: string) => {
        switch (shift) {
            case 'morning':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'evening':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'night':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Shift History">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading shift logs...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Shift History">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">Shift Logs</h2>
                        <p className="text-muted-foreground">View and manage shift handover logs</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        {/* Shift Filter */}
                        <select
                            value={shiftFilter}
                            onChange={(e) => setShiftFilter(e.target.value as any)}
                            className="px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        >
                            <option value="all">All Shifts</option>
                            <option value="morning">Morning</option>
                            <option value="evening">Evening</option>
                            <option value="night">Night</option>
                        </select>
                        <button
                            onClick={() => navigate('/shift/create')}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                        >
                            Create New Log
                        </button>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-primary/10 border border-primary text-primary px-4 py-3 rounded-md text-sm">
                        ✓ {success}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
                        {error}
                    </div>
                )}

                {/* Shift Logs List */}
                {filteredShiftLogs.length === 0 ? (
                    <div className="bg-card border border-border rounded-lg p-12 text-center">
                        <p className="text-muted-foreground mb-4">
                            {shiftFilter === 'all' ? 'No shift logs found' : `No ${shiftFilter} shift logs found`}
                        </p>
                        <button
                            onClick={() => navigate('/shift/create')}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                        >
                            Create First Shift Log
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredShiftLogs.map((log) => (
                            <div
                                key={log.id}
                                className={`bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${log.red_flag ? 'border-destructive border-2' : 'border-border'
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getShiftBadgeColor(
                                                log.shift
                                            )}`}
                                        >
                                            {log.shift}
                                        </span>
                                        {log.red_flag && (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-destructive text-destructive-foreground">
                                                🚩 Red Flag
                                            </span>
                                        )}
                                        {log.acknowledged && (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                ✓ Acknowledged
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-foreground">
                                            {log.supervisor?.full_name || 'Unknown Supervisor'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{formatDate(log.created_at)}</p>
                                    </div>
                                </div>

                                {/* Content Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Production Summary */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-foreground mb-1">Production Summary</h4>
                                        <p className="text-sm text-muted-foreground">{log.production_summary}</p>
                                    </div>

                                    {/* Equipment Status */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-foreground mb-1">Equipment Status</h4>
                                        <p className="text-sm text-muted-foreground">{log.equipment_status}</p>
                                    </div>

                                    {/* Safety Issues */}
                                    {log.safety_issues && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-destructive mb-1">Safety Issues</h4>
                                            <p className="text-sm text-muted-foreground">{log.safety_issues}</p>
                                        </div>
                                    )}

                                    {/* Next Shift Instructions */}
                                    {log.next_shift_instructions && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-foreground mb-1">
                                                Next Shift Instructions
                                            </h4>
                                            <p className="text-sm text-muted-foreground">{log.next_shift_instructions}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                {!log.acknowledged && (
                                    <div className="mt-4 pt-4 border-t border-border">
                                        <button
                                            onClick={() => handleAcknowledge(log.id)}
                                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity text-sm"
                                        >
                                            Acknowledge Shift
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
