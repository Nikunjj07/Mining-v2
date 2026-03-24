import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import apiClient, { setAuthToken, clearAuthToken, getAuthToken } from '../services/api.client';
import type { User } from '../types/database.types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<User | null>;
    signUp: (email: string, password: string, fullName: string, role: User['role']) => Promise<User | null>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if we have a stored token and fetch user profile
        const checkAuth = async () => {
            const token = getAuthToken();
            if (token) {
                try {
                    const response = await apiClient.get('/auth/me');
                    setUser(response.data.user);
                } catch (error) {
                    // Token invalid or expired
                    clearAuthToken();
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const signIn = async (email: string, password: string): Promise<User | null> => {
        const response = await apiClient.post('/auth/login', { email, password });
        const { user: userData, token } = response.data;

        setAuthToken(token);
        setUser(userData);

        return userData;
    };

    const signUp = async (
        email: string,
        password: string,
        fullName: string,
        role: User['role']
    ): Promise<User | null> => {
        const response = await apiClient.post('/auth/signup', {
            email,
            password,
            full_name: fullName,
            role,
        });
        const { user: userData, token } = response.data;

        setAuthToken(token);
        setUser(userData);

        return userData;
    };

    const signOut = async () => {
        clearAuthToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
