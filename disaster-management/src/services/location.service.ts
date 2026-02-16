// Location service for managing user locations and emergency coordinates
import { supabase } from '../lib/supabase';

export interface UserLocation {
    id: string;
    user_id: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    last_updated: string;
    is_active: boolean;
    user?: {
        id: string;
        full_name: string;
        email: string;
        role: string;
    };
}

export const updateUserLocation = async (
    userId: string,
    latitude: number,
    longitude: number,
    accuracy?: number
): Promise<void> => {
    // Check if location exists
    const { data: existing } = await supabase
        .from('user_locations')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (existing) {
        // Update existing location
        const { error } = await supabase
            .from('user_locations')
            .update({
                latitude,
                longitude,
                accuracy,
                is_active: true
            })
            .eq('user_id', userId);

        if (error) throw error;
    } else {
        // Insert new location
        const { error } = await supabase
            .from('user_locations')
            .insert([{
                user_id: userId,
                latitude,
                longitude,
                accuracy,
                is_active: true
            }]);

        if (error) throw error;
    }
};

export const getAllActiveLocations = async (): Promise<UserLocation[]> => {
    const { data, error } = await supabase
        .from('user_locations')
        .select(`
            *,
            user:users!user_locations_user_id_fkey(id, full_name, email, role)
        `)
        .eq('is_active', true);

    if (error) throw error;
    return data || [];
};

export const deactivateUserLocation = async (userId: string): Promise<void> => {
    const { error } = await supabase
        .from('user_locations')
        .update({ is_active: false })
        .eq('user_id', userId);

    if (error) throw error;
};

export const getEmergencyLocations = async () => {
    const { data, error } = await supabase
        .from('emergencies')
        .select(`
            *,
            reporter:users!emergencies_reported_by_fkey(id, full_name, email),
            assignee:users!emergencies_assigned_to_fkey(id, full_name, email)
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .eq('status', 'active');

    if (error) throw error;
    return data || [];
};
