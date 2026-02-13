import api from './api';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '../types';

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        return api.post('/auth/login', credentials);
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
        return api.post('/auth/register', data);
    },

    logout: async (): Promise<void> => {
        return api.post('/auth/logout');
    },

    getCurrentUser: async (): Promise<User> => {
        return api.get('/auth/me');
    },

    refreshToken: async (): Promise<{ token: string }> => {
        return api.post('/auth/refresh');
    },
};
