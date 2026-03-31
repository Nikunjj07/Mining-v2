// Emergency service - REST API implementation
import apiClient from './api.client';
import type { Emergency } from '../types/database.types';

export interface EmergencyWithRelations extends Emergency {
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

export interface CreateEmergencyData {
    type: Emergency['type'];
    severity: Emergency['severity'];
    location?: string;
    description?: string;
    latitude?: number | null;
    longitude?: number | null;
    reported_by?: string;
    status?: Emergency['status'];
}

export const createEmergency = async (emergencyData: CreateEmergencyData): Promise<Emergency> => {
    const response = await apiClient.post('/emergencies', emergencyData);
    return response.data.emergency;
};

// Normalize MongoDB _id to id for client compatibility
const normalize = <T extends { id?: string; _id?: string }>(item: T): T => {
    if (!item.id && item._id) {
        return { ...item, id: item._id };
    }
    return item;
};

export const getEmergencies = async (params?: {
    severity?: Emergency['severity'];
    status?: Emergency['status'];
    page?: number;
    limit?: number;
}): Promise<EmergencyWithRelations[]> => {
    const response = await apiClient.get('/emergencies', { params });
    return (response.data.emergencies as EmergencyWithRelations[]).map(normalize);
};

export const getEmergencyById = async (emergencyId: string): Promise<EmergencyWithRelations> => {
    const response = await apiClient.get(`/emergencies/${emergencyId}`);
    return response.data.emergency;
};

export const updateEmergencyStatus = async (
    emergencyId: string,
    status: Emergency['status']
): Promise<Emergency> => {
    const response = await apiClient.patch(`/emergencies/${emergencyId}/status`, { status });
    return response.data.emergency;
};

export const assignRescueTeam = async (emergencyId: string, userId: string): Promise<Emergency> => {
    const response = await apiClient.patch(`/emergencies/${emergencyId}/assign`, { assigned_to: userId });
    return response.data.emergency;
};

export const getAssignedEmergencies = async (_userId?: string): Promise<EmergencyWithRelations[]> => {
    const response = await apiClient.get('/emergencies/assigned');
    return (response.data.emergencies as EmergencyWithRelations[]).map(normalize);
};

export const updateEmergency = async (
    emergencyId: string,
    data: Partial<CreateEmergencyData & { status: Emergency['status'] }>
): Promise<Emergency> => {
    const response = await apiClient.put(`/emergencies/${emergencyId}`, data);
    return response.data.emergency;
};

export const deleteEmergency = async (emergencyId: string): Promise<void> => {
    await apiClient.delete(`/emergencies/${emergencyId}`);
};
