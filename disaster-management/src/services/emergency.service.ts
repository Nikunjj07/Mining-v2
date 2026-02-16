// Placeholder for emergency service
// This will contain functions for emergency operations

import { supabase } from "../lib/supabase";
import type { Emergency } from '../types/database.types';

export const createEmergency = async (emergencyData: Partial<Emergency>) => {
    const { data, error } = await supabase
        .from('emergencies')
        .insert([emergencyData])
        .select();

    if (error) throw error;
    return data;
};

export const getEmergencies = async () => {
    const { data, error } = await supabase
        .from('emergencies')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const updateEmergencyStatus = async (
    emergencyId: string,
    status: 'active' | 'in_progress' | 'resolved'
) => {
    const { data, error } = await supabase
        .from('emergencies')
        .update({ status })
        .eq('id', emergencyId)
        .select();

    if (error) throw error;
    return data;
};

export const assignRescueTeam = async (emergencyId: string, userId: string) => {
    const { data, error } = await supabase
        .from('emergencies')
        .update({ assigned_to: userId })
        .eq('id', emergencyId)
        .select();

    if (error) throw error;
    return data;
};
