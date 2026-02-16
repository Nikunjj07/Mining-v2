import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { createEmergency } from '../../../services/emergency.service';
import { DashboardLayout } from '../../../components/ui';

type EmergencyType = 'gas_leak' | 'fire' | 'collapse' | 'equipment_failure' | 'worker_trapped' | 'ventilation_failure';
type Severity = 'low' | 'medium' | 'high';

export default function EmergencyCreate() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [type, setType] = useState<EmergencyType>('gas_leak');
    const [severity, setSeverity] = useState<Severity>('medium');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const emergencyTypes = [
        { value: 'gas_leak', label: 'Gas Leak' },
        { value: 'fire', label: 'Fire' },
        { value: 'collapse', label: 'Structural Collapse' },
        { value: 'equipment_failure', label: 'Equipment Failure' },
        { value: 'worker_trapped', label: 'Worker Trapped' },
        { value: 'ventilation_failure', label: 'Ventilation Failure' },
    ];

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!location.trim()) {
            setError('Location is required');
            return;
        }

        if (!description.trim()) {
            setError('Description is required');
            return;
        }

        if (severity === 'high' && description.length < 20) {
            setError('High severity emergencies require a detailed description (at least 20 characters)');
            return;
        }

        setLoading(true);

        try {
            await createEmergency({
                type,
                severity,
                location: location.trim(),
                description: description.trim(),
                reported_by: user?.id,
                status: 'active',
            });

            setSuccess('Emergency reported successfully! Notifying rescue teams...');

            // Redirect after showing success message
            setTimeout(() => {
                navigate('/dashboard/supervisor');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to report emergency');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (sev: Severity) => {
        switch (sev) {
            case 'high':
                return 'border-destructive bg-destructive/5';
            case 'medium':
                return 'border-yellow-500 bg-yellow-500/5';
            case 'low':
                return 'border-green-500 bg-green-500/5';
        }
    };

    return (
        <DashboardLayout title="Report Emergency">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Report Emergency</h2>
                    <p className="text-muted-foreground">Report critical incidents requiring immediate attention</p>
                </div>

                <form onSubmit={handleSubmit} className={`bg-card border rounded-lg p-6 space-y-6 ${getSeverityColor(severity)}`}>
                    {/* Emergency Type */}
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
                            Emergency Type <span className="text-destructive">*</span>
                        </label>
                        <select
                            id="type"
                            value={type}
                            onChange={(e) => setType(e.target.value as EmergencyType)}
                            className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            required
                        >
                            {emergencyTypes.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Severity */}
                    <div>
                        <label htmlFor="severity" className="block text-sm font-medium text-foreground mb-2">
                            Severity Level <span className="text-destructive">*</span>
                        </label>
                        <select
                            id="severity"
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value as Severity)}
                            className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            required
                        >
                            <option value="low">Low - Minor issue, no immediate danger</option>
                            <option value="medium">Medium - Requires attention soon</option>
                            <option value="high">High - Critical, immediate action required</option>
                        </select>
                        {severity === 'high' && (
                            <p className="text-xs text-destructive mt-2 font-semibold">
                                ⚠️ HIGH SEVERITY - This will trigger immediate notifications to rescue teams
                            </p>
                        )}
                    </div>

                    {/* Location */}
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                            Location <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            placeholder="e.g., Section A, Level 3, Near Equipment Room"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                            Description <span className="text-destructive">*</span>
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={6}
                            className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                            placeholder="Provide detailed information about the emergency, including what happened, current status, and any immediate actions taken..."
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {description.length} characters {severity === 'high' && '(minimum 20 required for high severity)'}
                        </p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="bg-primary/10 border border-primary text-primary px-4 py-3 rounded-md text-sm">
                            ✓ {success}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 py-3 rounded-md font-semibold transition-opacity disabled:opacity-50 ${severity === 'high'
                                    ? 'bg-destructive text-destructive-foreground hover:opacity-90'
                                    : 'bg-primary text-primary-foreground hover:opacity-90'
                                }`}
                        >
                            {loading ? 'Reporting Emergency...' : severity === 'high' ? '🚨 Report Critical Emergency' : 'Report Emergency'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 bg-accent text-accent-foreground rounded-md font-semibold hover:opacity-90 transition-opacity"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
