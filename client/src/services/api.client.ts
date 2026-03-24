// API client with axios wrapper and auth header injection
import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'auth_token';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear and redirect
            localStorage.removeItem(TOKEN_KEY);
            // Only redirect if not already on login/signup
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Helper functions for token management
export const setAuthToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

export const clearAuthToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
};

// Type-safe API response wrapper
export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface ApiError {
    message: string;
    code?: string;
    errors?: Record<string, string[]>;
}

// Export the client
export default apiClient;
