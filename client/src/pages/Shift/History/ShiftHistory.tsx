import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecentShifts, acknowledgeShift } from '../../../services/shift.service';
import { useAuth } from '../../../context/AuthContext';
import { DashboardLayout, ShiftCard } from '../../../components/ui';
import { generateShiftReport } from '../../../utils/pdf-generator';

interface ShiftLog {
    id: string;
    created_by: string;
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
            const safeShiftLogs = Array.isArray(data) ? (data as ShiftLog[]) : [];
            setShiftLogs(safeShiftLogs);
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
    const safeShiftLogs = Array.isArray(shiftLogs) ? shiftLogs : [];
    const filteredShiftLogs = shiftFilter === 'all'
        ? safeShiftLogs
        : safeShiftLogs.filter(log => log.shift === shiftFilter);

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
                        {success}
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
                            <ShiftCard
                                key={log.id}
                                shiftLog={log}
                                onAcknowledge={handleAcknowledge}
                                onDownloadPDF={generateShiftReport}
                                showAcknowledgeButton={true}
                                showPDFButton={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
