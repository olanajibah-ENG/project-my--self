// src/services/authService.ts
import api from './api';
import type { AuthResponse } from '../types/auth.types';
import { STORAGE_KEYS } from '../config';

export const authService = {
    register: async (userData: any) => {
        const response = await api.post('auth/register/', userData);
        return response.data;
    },
    login: async (credentials: any): Promise<AuthResponse> => {
        const response = await api.post('auth/login/', credentials);
        const data = response.data;
        
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.access);
        localStorage.setItem(STORAGE_KEYS.REFRESH, data.refresh);
        localStorage.setItem(STORAGE_KEYS.ROLE, data.role);
        localStorage.setItem(STORAGE_KEYS.USER_ID, data.user_id.toString());
        
        return data;
    },
    logout: () => {
        localStorage.clear();
        window.location.href = '/auth';
    }
};
