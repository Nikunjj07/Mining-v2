// Placeholder for helper utilities

export const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
        case 'high':
            return 'bg-red-500 text-white';
        case 'medium':
            return 'bg-yellow-500 text-white';
        case 'low':
            return 'bg-green-500 text-white';
        default:
            return 'bg-gray-500 text-white';
    }
};

export const getStatusColor = (status: 'active' | 'in_progress' | 'resolved'): string => {
    switch (status) {
        case 'active':
            return 'bg-red-500 text-white';
        case 'in_progress':
            return 'bg-yellow-500 text-white';
        case 'resolved':
            return 'bg-green-500 text-white';
        default:
            return 'bg-gray-500 text-white';
    }
};
