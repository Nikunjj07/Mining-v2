// Hazard service - REST API implementation
import apiClient from './api.client';
import type { Hazard } from '../types/database.types';

export interface CreateHazardData {
    hazard_name: string;
    description?: string;
    risk_level: Hazard['risk_level'];
    control_measure?: string;
    responsible_person?: string;
    review_date?: string;
    status?: string;
}

export const createHazard = async (hazardData: CreateHazardData): Promise<Hazard> => {
    const response = await apiClient.post('/hazards', hazardData);
    return response.data.hazard;
};

export const getHazards = async (params?: {
    risk_level?: Hazard['risk_level'];
    status?: string;
    page?: number;
    limit?: number;
}): Promise<Hazard[]> => {
    const response = await apiClient.get('/hazards', { params });
    return response.data.hazards;
};

export const updateHazard = async (hazardId: string, hazardData: Partial<CreateHazardData>): Promise<Hazard> => {
    const response = await apiClient.patch(`/hazards/${hazardId}`, hazardData);
    return response.data.hazard;
};

export const deleteHazard = async (hazardId: string): Promise<void> => {
    await apiClient.delete(`/hazards/${hazardId}`);
};

export const getHazardById = async (hazardId: string): Promise<Hazard> => {
    const response = await apiClient.get(`/hazards/${hazardId}`);
    return response.data.hazard;
};

export const getHazardsByRiskLevel = async (riskLevel: Hazard['risk_level']): Promise<Hazard[]> => {
    const response = await apiClient.get('/hazards', { params: { risk_level: riskLevel } });
    return response.data.hazards;
};
