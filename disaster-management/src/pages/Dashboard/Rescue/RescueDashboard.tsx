import { DashboardLayout } from '../../../components/ui';

export default function RescueDashboard() {
    return (
        <DashboardLayout title="Rescue Team Dashboard">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Emergency Response</h2>
                    <p className="text-muted-foreground">Monitor and respond to active emergencies</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Assigned Emergencies */}
                    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Assigned to You</h3>
                        <p className="text-3xl font-bold text-destructive">3</p>
                        <p className="text-xs text-muted-foreground mt-1">Active emergencies</p>
                    </div>

                    {/* Resolved Today */}
                    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Resolved Today</h3>
                        <p className="text-3xl font-bold text-foreground">7</p>
                        <p className="text-xs text-muted-foreground mt-1">Successfully handled</p>
                    </div>

                    {/* Response Time */}
                    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Avg Response Time</h3>
                        <p className="text-3xl font-bold text-foreground">12m</p>
                        <p className="text-xs text-muted-foreground mt-1">This week</p>
                    </div>
                </div>

                {/* Active Emergencies List */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Active Emergencies</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                            <div>
                                <p className="font-medium text-foreground">Gas Leak - Section B</p>
                                <p className="text-sm text-muted-foreground">Reported 15 minutes ago</p>
                            </div>
                            <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-medium rounded-full">
                                HIGH
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-accent/10 border border-accent/20 rounded-md">
                            <div>
                                <p className="font-medium text-foreground">Equipment Failure - Tunnel 3</p>
                                <p className="text-sm text-muted-foreground">Reported 1 hour ago</p>
                            </div>
                            <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                                MEDIUM
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
