import { useState, useEffect } from 'react';
import { DashboardLayout, DashboardCard } from '../../../components/ui';
import { getShiftLogs } from '../../../services/shift.service';
import { getEmergencies } from '../../../services/emergency.service';
import { getHazards } from '../../../services/hazard.service';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Metrics {
    totalShiftsToday: number;
    pendingAcknowledgements: number;
    activeEmergencies: number;
    highSeverityEmergencies: number;
    totalHazards: number;
    highRiskHazards: number;
}

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState<Metrics>({
        totalShiftsToday: 0,
        pendingAcknowledgements: 0,
        activeEmergencies: 0,
        highSeverityEmergencies: 0,
        totalHazards: 0,
        highRiskHazards: 0,
    });
    const [emergencyData, setEmergencyData] = useState<any[]>([]);
    const [hazardData, setHazardData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all data
            const [shifts, emergencies, hazards] = await Promise.all([
                getShiftLogs(),
                getEmergencies(),
                getHazards(),
            ]);

            // Calculate metrics
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const shiftsToday = shifts.filter((s: any) => {
                const shiftDate = new Date(s.created_at);
                shiftDate.setHours(0, 0, 0, 0);
                return shiftDate.getTime() === today.getTime();
            });

            const pendingAcks = shifts.filter((s: any) => !s.acknowledged);
            const activeEmerg = emergencies.filter((e: any) => e.status === 'active');
            const highSevEmerg = emergencies.filter((e: any) => e.severity === 'high');
            const highRiskHaz = hazards.filter((h: any) => h.risk_level === 'high');

            setMetrics({
                totalShiftsToday: shiftsToday.length,
                pendingAcknowledgements: pendingAcks.length,
                activeEmergencies: activeEmerg.length,
                highSeverityEmergencies: highSevEmerg.length,
                totalHazards: hazards.length,
                highRiskHazards: highRiskHaz.length,
            });

            // Prepare chart data for emergencies by severity
            const severityCounts = {
                low: emergencies.filter((e: any) => e.severity === 'low').length,
                medium: emergencies.filter((e: any) => e.severity === 'medium').length,
                high: emergencies.filter((e: any) => e.severity === 'high').length,
            };

            setEmergencyData([
                { name: 'Low', value: severityCounts.low, color: '#22c55e' },
                { name: 'Medium', value: severityCounts.medium, color: '#eab308' },
                { name: 'High', value: severityCounts.high, color: '#ef4444' },
            ]);

            // Prepare chart data for hazards by risk level
            const riskCounts = {
                low: hazards.filter((h: any) => h.risk_level === 'low').length,
                medium: hazards.filter((h: any) => h.risk_level === 'medium').length,
                high: hazards.filter((h: any) => h.risk_level === 'high').length,
            };

            setHazardData([
                { name: 'Low', value: riskCounts.low, color: '#22c55e' },
                { name: 'Medium', value: riskCounts.medium, color: '#eab308' },
                { name: 'High', value: riskCounts.high, color: '#ef4444' },
            ]);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Admin Dashboard">
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
        <DashboardLayout title="Admin Dashboard">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Admin Dashboard</h2>
                    <p className="text-muted-foreground">Overview of all system metrics</p>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <DashboardCard
                        title="Shift Logs Today"
                        value={metrics.totalShiftsToday}
                        icon="📋"
                        variant="default"
                    />
                    <DashboardCard
                        title="Pending Acknowledgements"
                        value={metrics.pendingAcknowledgements}
                        icon="⏳"
                        variant={metrics.pendingAcknowledgements > 0 ? 'warning' : 'success'}
                    />
                    <DashboardCard
                        title="Active Emergencies"
                        value={metrics.activeEmergencies}
                        icon="🚨"
                        variant={metrics.activeEmergencies > 0 ? 'danger' : 'success'}
                    />
                    <DashboardCard
                        title="High Severity Emergencies"
                        value={metrics.highSeverityEmergencies}
                        icon="⚠️"
                        variant={metrics.highSeverityEmergencies > 0 ? 'danger' : 'success'}
                    />
                    <DashboardCard
                        title="Total Hazards"
                        value={metrics.totalHazards}
                        icon="⚠️"
                        variant="default"
                    />
                    <DashboardCard
                        title="High Risk Hazards"
                        value={metrics.highRiskHazards}
                        icon="🔴"
                        variant={metrics.highRiskHazards > 0 ? 'danger' : 'success'}
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Emergency Severity Chart */}
                    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                            Emergencies by Severity
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={emergencyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="name" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="value" name="Count">
                                    {emergencyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Hazard Risk Level Chart */}
                    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                            Hazards by Risk Level
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={hazardData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {hazardData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
