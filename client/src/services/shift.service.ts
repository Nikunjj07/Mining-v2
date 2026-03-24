// Shift service - REST API implementation
import apiClient from './api.client';
import type { ShiftLog } from '../types/database.types';

export interface ShiftLogWithRelations extends ShiftLog {
    supervisor?: {
        id: string;
        full_name: string;
        email: string;
    };
}

export interface CreateShiftLogData {
    created_by?: string;
    shift: ShiftLog['shift'];
    production_summary?: string;
    equipment_status?: string;
    safety_issues?: string;
    red_flag?: boolean;
    next_shift_instructions?: string;
}

export const createShiftLog = async (shiftData: CreateShiftLogData): Promise<ShiftLog> => {
    const response = await apiClient.post('/shifts', shiftData);
    return response.data.shiftLog;
};

export const getShiftLogs = async (params?: {
    shift?: ShiftLog['shift'];
    red_flag?: boolean;
    page?: number;
    limit?: number;
}): Promise<ShiftLogWithRelations[]> => {
    const response = await apiClient.get('/shifts', { params });
    return response.data.shift_logs;
};

export const acknowledgeShift = async (shiftLogId: string, _userId?: string): Promise<void> => {
    await apiClient.post(`/shifts/${shiftLogId}/acknowledge`);
};

export const getRecentShifts = async (limit: number = 10): Promise<ShiftLogWithRelations[]> => {
    const response = await apiClient.get('/shifts/recent', { params: { limit } });
    return response.data.shiftLogs;
};

export const getShiftById = async (shiftId: string): Promise<ShiftLogWithRelations> => {
    const response = await apiClient.get(`/shifts/${shiftId}`);
    return response.data.shiftLog;
};
