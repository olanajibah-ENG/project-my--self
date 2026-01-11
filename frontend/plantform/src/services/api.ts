// src/services/api.ts
import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../config';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const publicUrls = ['auth/login/', 'auth/register/'];

    if (token && !publicUrls.includes(config.url || '')) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
