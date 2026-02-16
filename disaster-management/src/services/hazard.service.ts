// Placeholder for hazard service
// This will contain functions for hazard management operations

import { supabase } from '../lib/supabase';
import type { Hazard } from '../types/database.types';

export const createHazard = async (hazardData: Partial<Hazard>) => {
    const { data, error } = await supabase
        .from('hazards')
        .insert([hazardData])
        .select();

    if (error) throw error;
    return data;
};

export const getHazards = async () => {
    const { data, error } = await supabase
        .from('hazards')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const updateHazard = async (hazardId: string, hazardData: Partial<Hazard>) => {
    const { data, error } = await supabase
        .from('hazards')
        .update(hazardData)
        .eq('id', hazardId)
        .select();

    if (error) throw error;
    return data;
};

export const deleteHazard = async (hazardId: string) => {
    const { error } = await supabase
        .from('hazards')
        .delete()
        .eq('id', hazardId);

    if (error) throw error;
};

export const getHazardById = async (id: string) => {
    const { data, error } = await supabase
        .from('hazards')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

export const getHazardsByRiskLevel = async (riskLevel: 'low' | 'medium' | 'high') => {
    const { data, error } = await supabase
        .from('hazards')
        .select('*')
        .eq('risk_level', riskLevel)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};
