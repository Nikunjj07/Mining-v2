// Location service - REST API implementation
import apiClient from './api.client';
import type { Emergency } from '../types/database.types';

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

export interface EmergencyLocation extends Emergency {
    reporter?: {
        id: string;
        full_name: string;
        email: string;
    };
    assignee?: {
        id: string;
        full_name: string;
        email: string;
    };
}

export const updateUserLocation = async (
    latitude: number,
    longitude: number,
    accuracy?: number
): Promise<void> => {
    await apiClient.post('/locations/update', { latitude, longitude, accuracy });
};

export const getAllActiveLocations = async (): Promise<UserLocation[]> => {
    const response = await apiClient.get('/locations/active');
    return response.data.locations;
};

export const deactivateUserLocation = async (): Promise<void> => {
    await apiClient.post('/locations/deactivate');
};

export const getEmergencyLocations = async (): Promise<EmergencyLocation[]> => {
    // Get active emergencies with location data
    const response = await apiClient.get('/emergencies', {
        params: { status: 'active' }
    });
    // Filter to only include emergencies with lat/lng
    return (response.data.emergencies || []).filter(
        (e: Emergency) => e.latitude != null && e.longitude != null
    );
};
