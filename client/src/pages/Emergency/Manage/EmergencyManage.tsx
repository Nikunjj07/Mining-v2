import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmergencies, updateEmergencyStatus, assignRescueTeam } from '../../../services/emergency.service';
import { DashboardLayout, StatusBadge } from '../../../components/ui';
import apiClient from '../../../services/api.client';

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

interface User {
    id: string;
    full_name: string;
    email: string;
    role: string;
}

export default function EmergencyManage() {
    const navigate = useNavigate();
    const [emergencies, setEmergencies] = useState<Emergency[]>([]);
    const [rescueTeamMembers, setRescueTeamMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'in_progress' | 'resolved'>('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch emergencies
            const emergencyResponse = await getEmergencies();
            setEmergencies(emergencyResponse.emergencies as Emergency[]);

            // Fetch rescue team members
            try {
                const rescueResponse = await apiClient.get('/users/rescue');
                setRescueTeamMembers(rescueResponse.data.users || []);
            } catch {
                // Rescue endpoint might not exist, silently fail
                console.log('Rescue team endpoint not available');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (emergencyId: string, newStatus: 'active' | 'in_progress' | 'resolved') => {
        try {
            await updateEmergencyStatus(emergencyId, newStatus);
            setSuccess(`Emergency status updated to ${newStatus}`);

            // Update local state
            setEmergencies(prev =>
                prev.map(em =>
                    em.id === emergencyId ? { ...em, status: newStatus } : em
                )
            );

            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to update status');
            console.error(err);
        }
    };

    const handleAssignRescueTeam = async (emergencyId: string, userId: string) => {
        try {
            // If userId is empty string, don't make the API call
            if (!userId) {
                setError('Please select a rescue team member');
                setTimeout(() => setError(''), 3000);
                return;
            }

            await assignRescueTeam(emergencyId, userId);
            setSuccess('Rescue team assigned successfully');

            // Refresh data to get updated assignee info
            await fetchData();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to assign rescue team');
            console.error(err);
            setTimeout(() => setError(''), 3000);
        }
    };

    // Filter emergencies
    const filteredEmergencies = emergencies.filter(em => {
        const matchesSeverity = severityFilter === 'all' || em.severity === severityFilter;
        const matchesStatus = statusFilter === 'all' || em.status === statusFilter;
        return matchesSeverity && matchesStatus;
    });

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

    if (loading) {
        return (
            <DashboardLayout title="Emergency Management">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading emergencies...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Emergency Management">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">Emergency Management</h2>
                        <p className="text-muted-foreground">Monitor and manage all reported emergencies</p>
                    </div>
                    <button
                        onClick={() => navigate('/emergency/create')}
                        className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity"
                    >
                        Report New Emergency
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-3 items-center">
                    <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value as any)}
                        className="px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    >
                        <option value="all">All Severities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </select>
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
                        <p className="text-muted-foreground mb-4">No emergencies found</p>
                        <button
                            onClick={() => navigate('/emergency/create')}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                        >
                            Report First Emergency
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredEmergencies.map((emergency) => (
                            <div
                                key={emergency.id}
                                className={`bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${emergency.severity === 'high' ? 'border-destructive border-2' : 'border-border'
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3 flex-wrap">
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
                                    <p className="text-xs text-muted-foreground">{formatDate(emergency.created_at)}</p>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-foreground mb-1">Location</h4>
                                        <p className="text-sm text-muted-foreground">{emergency.location}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-foreground mb-1">Reported By</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {emergency.reporter?.full_name || 'Unknown'}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <h4 className="text-sm font-semibold text-foreground mb-1">Description</h4>
                                        <p className="text-sm text-muted-foreground">{emergency.description}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                                    {/* Status Change */}
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium text-foreground">Status:</label>
                                        <select
                                            value={emergency.status}
                                            onChange={(e) => handleStatusChange(emergency.id, e.target.value as any)}
                                            className="px-3 py-1 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                                        >
                                            <option value="active">Active</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                    </div>

                                    {/* Rescue Team Assignment */}
                                    {rescueTeamMembers.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-medium text-foreground">Assign to:</label>
                                            <select
                                                value={emergency.assigned_to || ''}
                                                onChange={(e) => handleAssignRescueTeam(emergency.id, e.target.value)}
                                                className="px-3 py-1 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                                            >
                                                <option value="">Unassigned</option>
                                                {rescueTeamMembers.map((member) => (
                                                    <option key={member.id} value={member.id}>
                                                        {member.full_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {emergency.assigned_to && emergency.assignee && (
                                        <div className="text-sm text-muted-foreground">
                                            Currently assigned to: <span className="font-medium text-foreground">{emergency.assignee.full_name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
