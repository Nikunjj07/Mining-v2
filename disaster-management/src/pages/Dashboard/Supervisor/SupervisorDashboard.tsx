import { DashboardLayout } from '../../../components/ui';
import { useNavigate } from 'react-router-dom';

export default function SupervisorDashboard() {
    const navigate = useNavigate();

    return (
        <DashboardLayout title="Supervisor Dashboard">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Shift Management</h2>
                    <p className="text-muted-foreground">Monitor shift logs and team operations</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Today's Shift Logs */}
                    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Today's Shift Logs</h3>
                        <p className="text-3xl font-bold text-foreground">8</p>
                        <p className="text-xs text-muted-foreground mt-1">3 pending acknowledgment</p>
                    </div>

                    {/* Active Emergencies */}
                    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Emergencies</h3>
                        <p className="text-3xl font-bold text-destructive">2</p>
                        <p className="text-xs text-muted-foreground mt-1">Requires immediate action</p>
                    </div>

                    {/* Team Members */}
                    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Team Members</h3>
                        <p className="text-3xl font-bold text-foreground">15</p>
                        <p className="text-xs text-muted-foreground mt-1">On current shift</p>
                    </div>
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
                        <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity">
                            Report Emergency
                        </button>
                        <button className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:opacity-90 transition-opacity">
                            View Team Status
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
