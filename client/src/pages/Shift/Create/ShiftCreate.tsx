import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { createShiftLog } from '../../../services/shift.service';
import { DashboardLayout } from '../../../components/ui';

export default function ShiftCreate() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [shift, setShift] = useState<'morning' | 'evening' | 'night'>('morning');
    const [productionSummary, setProductionSummary] = useState('');
    const [equipmentStatus, setEquipmentStatus] = useState('');
    const [safetyIssues, setSafetyIssues] = useState('');
    const [redFlag, setRedFlag] = useState(false);
    const [nextShiftInstructions, setNextShiftInstructions] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation: Red flag must have safety issues or next shift instructions
        if (redFlag && !safetyIssues.trim() && !nextShiftInstructions.trim()) {
            setError('Red flag requires either safety issues or next shift instructions to be specified');
            return;
        }

        setLoading(true);

        try {
            await createShiftLog({
                created_by: user?.id,
                shift,
                production_summary: productionSummary,
                equipment_status: equipmentStatus,
                safety_issues: safetyIssues || undefined,
                red_flag: redFlag,
                next_shift_instructions: nextShiftInstructions || undefined,
            });

            setSuccess('Shift log created successfully!');

            // Redirect after showing success message
            setTimeout(() => {
                navigate('/shift/history');
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to create shift log');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Create Shift Log">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">New Shift Log</h2>
                    <p className="text-muted-foreground">Record shift activities and handover information</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6">
                    {/* Shift Selector */}
                    <div>
                        <label htmlFor="shift" className="block text-sm font-medium text-foreground mb-2">
                            Shift <span className="text-destructive">*</span>
                        </label>
                        <select
                            id="shift"
                            value={shift}
                            onChange={(e) => setShift(e.target.value as any)}
                            className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            required
                        >
                            <option value="morning">Morning Shift (6 AM - 2 PM)</option>
                            <option value="evening">Evening Shift (2 PM - 10 PM)</option>
                            <option value="night">Night Shift (10 PM - 6 AM)</option>
                        </select>
                    </div>

                    {/* Production Summary */}
                    <div>
                        <label htmlFor="productionSummary" className="block text-sm font-medium text-foreground mb-2">
                            Production Summary <span className="text-destructive">*</span>
                        </label>
                        <textarea
                            id="productionSummary"
                            value={productionSummary}
                            onChange={(e) => setProductionSummary(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                            placeholder="Describe production activities, output, and progress during this shift..."
                            required
                        />
                    </div>

                    {/* Equipment Status */}
                    <div>
                        <label htmlFor="equipmentStatus" className="block text-sm font-medium text-foreground mb-2">
                            Equipment Status <span className="text-destructive">*</span>
                        </label>
                        <textarea
                            id="equipmentStatus"
                            value={equipmentStatus}
                            onChange={(e) => setEquipmentStatus(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                            placeholder="Report equipment condition, maintenance performed, or issues encountered..."
                            required
                        />
                    </div>

                    {/* Safety Issues */}
                    <div>
                        <label htmlFor="safetyIssues" className="block text-sm font-medium text-foreground mb-2">
                            Safety Issues
                        </label>
                        <textarea
                            id="safetyIssues"
                            value={safetyIssues}
                            onChange={(e) => setSafetyIssues(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                            placeholder="Report any safety concerns, incidents, or hazards observed..."
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Required if red flag is checked
                        </p>
                    </div>

                    {/* Red Flag */}
                    <div className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-md">
                        <input
                            type="checkbox"
                            id="redFlag"
                            checked={redFlag}
                            onChange={(e) => setRedFlag(e.target.checked)}
                            className="mt-1 w-4 h-4 text-destructive focus:ring-destructive border-border rounded"
                        />
                        <div className="flex-1">
                            <label htmlFor="redFlag" className="block text-sm font-medium text-foreground cursor-pointer">
                                Red Flag - Critical Issue
                            </label>
                            <p className="text-xs text-muted-foreground mt-1">
                                Check this if there are critical safety issues or urgent matters requiring immediate attention from the next shift
                            </p>
                        </div>
                    </div>

                    {/* Next Shift Instructions */}
                    <div>
                        <label htmlFor="nextShiftInstructions" className="block text-sm font-medium text-foreground mb-2">
                            Next Shift Instructions
                        </label>
                        <textarea
                            id="nextShiftInstructions"
                            value={nextShiftInstructions}
                            onChange={(e) => setNextShiftInstructions(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                            placeholder="Provide instructions, priorities, or important information for the incoming shift..."
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Required if red flag is checked
                        </p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="bg-primary/10 border border-primary text-primary px-4 py-3 rounded-md text-sm">
                            {success}
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
                            className="flex-1 bg-primary text-primary-foreground py-3 rounded-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? 'Creating Shift Log...' : 'Create Shift Log'}
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
