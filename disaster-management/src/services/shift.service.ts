// Placeholder for shift service
// This will contain functions for shift log operations

import { supabase } from '../lib/supabase';
import type { ShiftLog } from '../types/database.types';

export const createShiftLog = async (shiftData: Partial<ShiftLog>) => {
    const { data, error } = await supabase
        .from('shift_logs')
        .insert([shiftData])
        .select();

    if (error) throw error;
    return data;
};

export const getShiftLogs = async () => {
    const { data, error } = await supabase
        .from('shift_logs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const acknowledgeShift = async (shiftLogId: string, userId: string) => {
    const { data, error } = await supabase
        .from('shift_acknowledgements')
        .insert([{ shift_log_id: shiftLogId, acknowledged_by: userId }])
        .select();

    if (error) throw error;
    return data;
};

export const getRecentShifts = async (limit: number = 10) => {
    const { data, error } = await supabase
        .from('shift_logs')
        .select(`
            *,
            supervisor:users!supervisor_id(id, full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
};
