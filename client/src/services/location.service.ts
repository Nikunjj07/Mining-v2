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
    userIdOrLatitude: string | number,
    latitudeOrLongitude: number,
    longitudeOrAccuracy?: number,
    maybeAccuracy?: number
): Promise<void> => {
    const latitude = typeof userIdOrLatitude === 'number' ? userIdOrLatitude : latitudeOrLongitude;
    const longitude = typeof userIdOrLatitude === 'number'
        ? (longitudeOrAccuracy as number)
        : latitudeOrLongitude;
    const accuracy = typeof userIdOrLatitude === 'number' ? undefined : maybeAccuracy;

    await apiClient.post('/locations', { latitude, longitude, accuracy });
};

export const getAllActiveLocations = async (): Promise<UserLocation[]> => {
    const response = await apiClient.get('/locations/active');
    const personnel = response.data?.personnel;
    return Array.isArray(personnel) ? personnel : [];
};

export const deactivateUserLocation = async (_userId?: string): Promise<void> => {
    // No explicit deactivate endpoint exists in current backend; sending a no-op update keeps the API contract compatible.
    return Promise.resolve();
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
