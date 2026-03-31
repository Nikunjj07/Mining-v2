import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout, DashboardCard, ShiftCard } from '../../../components/ui';
import { useAuth } from '../../../context/AuthContext';
import { getShiftLogs, acknowledgeShift } from '../../../services/shift.service';
import { getEmergencies } from '../../../services/emergency.service';

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

export default function SupervisorDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [shifts, setShifts] = useState<ShiftLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        shiftsToday: 0,
        pendingAcks: 0,
        activeEmergencies: 0,
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [shiftsData, emergenciesData] = await Promise.all([
                getShiftLogs(),
                getEmergencies(),
            ]);

            setShifts(shiftsData as ShiftLog[]);

            // Calculate metrics
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const shiftsToday = shiftsData.filter((s: any) => {
                const shiftDate = new Date(s.created_at);
                shiftDate.setHours(0, 0, 0, 0);
                return shiftDate.getTime() === today.getTime();
            });

            const pendingAcks = shiftsData.filter((s: any) => !s.acknowledged);
            const activeEmerg = emergenciesData.filter((e: any) => e.status === 'active');

            setMetrics({
                shiftsToday: shiftsToday.length,
                pendingAcks: pendingAcks.length,
                activeEmergencies: activeEmerg.length,
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async (shiftId: string) => {
        if (!user?.id) return;

        try {
            await acknowledgeShift(shiftId, user.id);
            await fetchDashboardData(); // Refresh data
        } catch (error) {
            console.error('Failed to acknowledge shift:', error);
        }
    };

    // Get recent shifts (last 5)
    const recentShifts = shifts.slice(0, 5);

    if (loading) {
        return (
            <DashboardLayout title="Supervisor Dashboard">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Supervisor Dashboard">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Shift Management</h2>
                    <p className="text-muted-foreground">Monitor shift logs and team operations</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DashboardCard
                        title="Shift Logs Today"
                        value={metrics.shiftsToday}
                        icon="list"
                        variant="default"
                    />
                    <DashboardCard
                        title="Pending Acknowledgements"
                        value={metrics.pendingAcks}
                        icon="pending"
                        variant={metrics.pendingAcks > 0 ? 'warning' : 'success'}
                    />
                    <DashboardCard
                        title="Active Emergencies"
                        value={metrics.activeEmergencies}
                        icon="alert"
                        variant={metrics.activeEmergencies > 0 ? 'danger' : 'success'}
                    />
                </div>

                {/* Quick Actions */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => navigate('/shift/create')}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                        >
                            Create Shift Log
                        </button>
                        <button
                            onClick={() => navigate('/shift/history')}
                            className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:opacity-90 transition-opacity"
                        >
                            View Shift History
                        </button>
                        <button
                            onClick={() => navigate('/emergency/create')}
                            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity"
                        >
                            Report Emergency
                        </button>
                    </div>
                </div>

                {/* Recent Shifts */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground">Recent Shifts</h3>
                        <button
                            onClick={() => navigate('/shift/history')}
                            className="text-sm text-primary hover:underline"
                        >
                            View All →
                        </button>
                    </div>

                    {recentShifts.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            No shift logs yet. Create your first shift log to get started.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {recentShifts.map((shift) => (
                                <ShiftCard
                                    key={shift.id}
                                    shiftLog={shift}
                                    onAcknowledge={handleAcknowledge}
                                    showAcknowledgeButton={!shift.acknowledged && user?.role === 'supervisor'}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
