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
        .select(`
            *,
            supervisor:users!shift_logs_supervisor_id_fkey(id, full_name, email)
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const acknowledgeShift = async (shiftLogId: string, userId: string) => {
    // Create acknowledgement record
    const { error: ackError } = await supabase
        .from('shift_acknowledgements')
        .insert([{ shift_log_id: shiftLogId, acknowledged_by: userId }]);

    if (ackError) throw ackError;

    // Update shift log to mark as acknowledged
    const { data, error } = await supabase
        .from('shift_logs')
        .update({ acknowledged: true })
        .eq('id', shiftLogId)
        .select();

    if (error) throw error;
    return data;
};

export const getRecentShifts = async (limit: number = 10) => {
    const { data, error } = await supabase
        .from('shift_logs')
        .select(`
            *,
            supervisor:users!shift_logs_supervisor_id_fkey(id, full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
};
