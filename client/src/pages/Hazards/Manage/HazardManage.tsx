import { useState, useEffect } from 'react';
import { getHazards, createHazard, updateHazard, deleteHazard } from '../../../services/hazard.service';
import { DashboardLayout, StatusBadge } from '../../../components/ui';

interface Hazard {
    id: string;
    hazard_name: string;
    description: string;
    risk_level: 'low' | 'medium' | 'high';
    control_measure: string;
    responsible_person: string;
    review_date: string;
    created_at: string;
}

export default function HazardManage() {
    const [hazards, setHazards] = useState<Hazard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
    const [showForm, setShowForm] = useState(false);
    const [editingHazard, setEditingHazard] = useState<Hazard | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        hazard_name: '',
        description: '',
        risk_level: 'medium' as 'low' | 'medium' | 'high',
        control_measure: '',
        responsible_person: '',
        review_date: '',
    });

    useEffect(() => {
        fetchHazards();
    }, []);

    const fetchHazards = async () => {
        try {
            setLoading(true);
            const data = await getHazards();
            setHazards(data as Hazard[]);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch hazards');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (editingHazard) {
                await updateHazard(editingHazard.id, formData);
                setSuccess('Hazard updated successfully');
            } else {
                await createHazard(formData);
                setSuccess('Hazard created successfully');
            }

            // Reset form and refresh data
            resetForm();
            await fetchHazards();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save hazard');
            console.error(err);
        }
    };

    const handleEdit = (hazard: Hazard) => {
        setEditingHazard(hazard);
        setFormData({
            hazard_name: hazard.hazard_name,
            description: hazard.description,
            risk_level: hazard.risk_level,
            control_measure: hazard.control_measure,
            responsible_person: hazard.responsible_person,
            review_date: hazard.review_date,
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this hazard?')) return;

        try {
            await deleteHazard(id);
            setSuccess('Hazard deleted successfully');
            await fetchHazards();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to delete hazard');
            console.error(err);
        }
    };

    const resetForm = () => {
        setFormData({
            hazard_name: '',
            description: '',
            risk_level: 'medium',
            control_measure: '',
            responsible_person: '',
            review_date: '',
        });
        setEditingHazard(null);
        setShowForm(false);
    };

    const getRiskVariant = (risk: string): 'danger' | 'warning' | 'success' => {
        switch (risk) {
            case 'high': return 'danger';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'warning';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Filter hazards
    const filteredHazards = hazards.filter(h => {
        if (riskFilter === 'all') return true;
        return h.risk_level === riskFilter;
    });

    if (loading) {
        return (
            <DashboardLayout title="Hazard Management">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading hazards...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Hazard Management">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">Hazard Management</h2>
                        <p className="text-muted-foreground">Identify and manage workplace hazards</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                    >
                        {showForm ? 'Cancel' : '+ Add New Hazard'}
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

                {/* Hazard Form */}
                {showForm && (
                    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                            {editingHazard ? 'Edit Hazard' : 'Add New Hazard'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Hazard Name */}
                                <div>
                                    <label htmlFor="hazard_name" className="block text-sm font-medium text-foreground mb-2">
                                        Hazard Name <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="hazard_name"
                                        value={formData.hazard_name}
                                        onChange={(e) => setFormData({ ...formData, hazard_name: e.target.value })}
                                        className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                        placeholder="e.g., Slippery Floor"
                                        required
                                    />
                                </div>

                                {/* Risk Level */}
                                <div>
                                    <label htmlFor="risk_level" className="block text-sm font-medium text-foreground mb-2">
                                        Risk Level <span className="text-destructive">*</span>
                                    </label>
                                    <select
                                        id="risk_level"
                                        value={formData.risk_level}
                                        onChange={(e) => setFormData({ ...formData, risk_level: e.target.value as any })}
                                        className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                        required
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                {/* Responsible Person */}
                                <div>
                                    <label htmlFor="responsible_person" className="block text-sm font-medium text-foreground mb-2">
                                        Responsible Person <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="responsible_person"
                                        value={formData.responsible_person}
                                        onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
                                        className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                        placeholder="e.g., John Doe"
                                        required
                                    />
                                </div>

                                {/* Review Date */}
                                <div>
                                    <label htmlFor="review_date" className="block text-sm font-medium text-foreground mb-2">
                                        Review Date <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="review_date"
                                        value={formData.review_date}
                                        onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
                                        className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                                    Description <span className="text-destructive">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                                    placeholder="Describe the hazard..."
                                    required
                                />
                            </div>

                            {/* Control Measure */}
                            <div>
                                <label htmlFor="control_measure" className="block text-sm font-medium text-foreground mb-2">
                                    Control Measure <span className="text-destructive">*</span>
                                </label>
                                <textarea
                                    id="control_measure"
                                    value={formData.control_measure}
                                    onChange={(e) => setFormData({ ...formData, control_measure: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                                    placeholder="Describe the control measures..."
                                    required
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-semibold"
                                >
                                    {editingHazard ? 'Update Hazard' : 'Create Hazard'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-2 bg-accent text-accent-foreground rounded-md hover:opacity-90 transition-opacity"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Filter */}
                <div className="flex gap-3 items-center">
                    <label className="text-sm font-medium text-foreground">Filter by Risk Level:</label>
                    <select
                        value={riskFilter}
                        onChange={(e) => setRiskFilter(e.target.value as any)}
                        className="px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    >
                        <option value="all">All Levels</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>

                {/* Hazards List */}
                {filteredHazards.length === 0 ? (
                    <div className="bg-card border border-border rounded-lg p-12 text-center">
                        <p className="text-muted-foreground mb-4">No hazards found</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                        >
                            Add First Hazard
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredHazards.map((hazard) => (
                            <div
                                key={hazard.id}
                                className={`bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${hazard.risk_level === 'high' ? 'border-destructive border-2' : 'border-border'
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-foreground mb-2">{hazard.hazard_name}</h3>
                                        <StatusBadge variant={getRiskVariant(hazard.risk_level)}>
                                            {hazard.risk_level.toUpperCase()} RISK
                                        </StatusBadge>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-3">
                                    <h4 className="text-sm font-semibold text-foreground mb-1">Description</h4>
                                    <p className="text-sm text-muted-foreground">{hazard.description}</p>
                                </div>

                                {/* Control Measure */}
                                <div className="mb-3">
                                    <h4 className="text-sm font-semibold text-foreground mb-1">Control Measure</h4>
                                    <p className="text-sm text-muted-foreground">{hazard.control_measure}</p>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-t border-border pt-3">
                                    <div>
                                        <h4 className="text-xs font-semibold text-muted-foreground mb-1">Responsible Person</h4>
                                        <p className="text-sm text-foreground">{hazard.responsible_person}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-muted-foreground mb-1">Review Date</h4>
                                        <p className="text-sm text-foreground">{formatDate(hazard.review_date)}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(hazard)}
                                        className="flex-1 px-3 py-2 bg-accent text-accent-foreground rounded-md hover:opacity-90 transition-opacity text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(hazard.id)}
                                        className="flex-1 px-3 py-2 bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
