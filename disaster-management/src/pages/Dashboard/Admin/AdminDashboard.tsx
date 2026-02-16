import { DashboardLayout } from '../../../components/ui';

export default function AdminDashboard() {
    return (
        <DashboardLayout title="Admin Dashboard">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Welcome, Admin</h2>
                    <p className="text-muted-foreground">Manage your disaster response operations</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Shifts */}
                    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Shifts</h3>
                        <p className="text-3xl font-bold text-foreground">24</p>
                        <p className="text-xs text-muted-foreground mt-1">This month</p>
                    </div>

                    {/* Active Emergencies */}
                    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Emergencies</h3>
                        <p className="text-3xl font-bold text-destructive">3</p>
                        <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                    </div>

                    {/* Hazards Tracked */}
                    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Hazards Tracked</h3>
                        <p className="text-3xl font-bold text-foreground">12</p>
                        <p className="text-xs text-muted-foreground mt-1">Under monitoring</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
