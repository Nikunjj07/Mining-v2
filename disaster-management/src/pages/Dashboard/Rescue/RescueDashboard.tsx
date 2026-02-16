import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getAssignedEmergencies, updateEmergencyStatus } from '../../../services/emergency.service';
import { DashboardLayout, EmergencyCard } from '../../../components/ui';

interface Emergency {
    id: string;
    type: 'gas_leak' | 'fire' | 'collapse' | 'equipment_failure' | 'worker_trapped' | 'ventilation_failure';
    severity: 'low' | 'medium' | 'high';
    location: string;
    description: string;
    status: 'active' | 'in_progress' | 'resolved';
    reported_by: string;
    assigned_to?: string;
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
}

export default function RescueDashboard() {
    const { user } = useAuth();
    const [emergencies, setEmergencies] = useState<Emergency[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'in_progress' | 'resolved'>('all');

    useEffect(() => {
        if (user?.id) {
            fetchAssignedEmergencies();
        }
    }, [user]);

    const fetchAssignedEmergencies = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const data = await getAssignedEmergencies(user.id);
            setEmergencies(data as Emergency[]);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch assigned emergencies');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (emergencyId: string, newStatus: 'active' | 'in_progress' | 'resolved') => {
        try {
            await updateEmergencyStatus(emergencyId, newStatus);
            setSuccess(`Emergency status updated to ${newStatus.replace('_', ' ')}`);

            // Update local state
            setEmergencies(prev =>
                prev.map(em =>
                    em.id === emergencyId ? { ...em, status: newStatus } : em
                )
            );

            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update status');
            console.error(err);
        }
    };

    // Filter emergencies
    const filteredEmergencies = emergencies.filter(em => {
        if (filter === 'all') return true;
        return em.status === filter;
    });

    // Calculate statistics
    const stats = {
        total: emergencies.length,
        active: emergencies.filter(e => e.status === 'active').length,
        inProgress: emergencies.filter(e => e.status === 'in_progress').length,
        resolved: emergencies.filter(e => e.status === 'resolved').length,
        highSeverity: emergencies.filter(e => e.severity === 'high' && e.status !== 'resolved').length,
    };

    if (loading) {
        return (
            <DashboardLayout title="Rescue Dashboard">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading assigned emergencies...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Rescue Dashboard">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Rescue Team Dashboard</h2>
                    <p className="text-muted-foreground">Manage your assigned emergencies</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Assigned</h3>
                        <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                    </div>
                    <div className="bg-card border border-destructive rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Active</h3>
                        <p className="text-3xl font-bold text-destructive">{stats.active}</p>
                    </div>
                    <div className="bg-card border border-yellow-500 rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">In Progress</h3>
                        <p className="text-3xl font-bold text-yellow-500">{stats.inProgress}</p>
                    </div>
                    <div className="bg-card border border-green-500 rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Resolved</h3>
                        <p className="text-3xl font-bold text-green-500">{stats.resolved}</p>
                    </div>
                    <div className="bg-destructive/10 border border-destructive rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-medium text-destructive mb-1">High Priority</h3>
                        <p className="text-3xl font-bold text-destructive">{stats.highSeverity}</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 border-b border-border">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 font-medium transition-colors ${filter === 'all'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        All ({stats.total})
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-4 py-2 font-medium transition-colors ${filter === 'active'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Active ({stats.active})
                    </button>
                    <button
                        onClick={() => setFilter('in_progress')}
                        className={`px-4 py-2 font-medium transition-colors ${filter === 'in_progress'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        In Progress ({stats.inProgress})
                    </button>
                    <button
                        onClick={() => setFilter('resolved')}
                        className={`px-4 py-2 font-medium transition-colors ${filter === 'resolved'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Resolved ({stats.resolved})
                    </button>
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

                {/* Emergencies List */}
                {filteredEmergencies.length === 0 ? (
                    <div className="bg-card border border-border rounded-lg p-12 text-center">
                        <p className="text-muted-foreground mb-2">
                            {filter === 'all'
                                ? 'No emergencies assigned to you yet'
                                : `No ${filter.replace('_', ' ')} emergencies`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Check back later or contact your supervisor for assignments
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredEmergencies.map((emergency) => (
                            <EmergencyCard
                                key={emergency.id}
                                emergency={emergency}
                                onStatusChange={handleStatusChange}
                                showStatusChange={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
