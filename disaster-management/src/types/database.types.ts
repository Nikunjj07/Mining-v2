// Placeholder for database types
// This will be populated with TypeScript types for your database schema

export interface User {
    id: string;
    email: string;
    full_name?: string;
    role: 'admin' | 'supervisor' | 'worker' | 'rescue';
    phone_number?: string;
    created_at: string;
}

export interface ShiftLog {
    id: string;
    shift: 'morning' | 'evening' | 'night';
    production_summary?: string;
    equipment_status?: string;
    safety_issues?: string;
    red_flag: boolean;
    next_shift_instructions?: string;
    acknowledged: boolean;
    created_by: string;
    created_at: string;
}

export interface Emergency {
    id: string;
    type: 'gas_leak' | 'fire' | 'collapse' | 'equipment_failure' | 'worker_trapped' | 'ventilation_failure';
    severity: 'low' | 'medium' | 'high';
    location?: string;
    description?: string;
    status: 'active' | 'in_progress' | 'resolved';
    reported_by: string;
    assigned_to?: string;
    created_at: string;
    resolved_at?: string;
}

export interface Hazard {
    id: string;
    hazard_name: string;
    description?: string;
    risk_level: 'low' | 'medium' | 'high';
    control_measure?: string;
    responsible_person?: string;
    review_date?: string;
    status: string;
    created_at: string;
}
