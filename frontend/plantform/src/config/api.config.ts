// src/config/api.config.ts

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Interceptor لإضافة التوكن تلقائياً
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Adding token to request:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor للتعامل مع الأخطاء
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message
    });
    
    if (error.response?.status === 401) {
      // Token expired - يمكن إعادة التوجيه لصفحة تسجيل الدخول
      console.log('🔄 Token expired, redirecting to login...');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const API_ENDPOINTS = {
  COURSES: '/courses/',
  COURSE_BY_ID: (id: number) => `/courses/${id}/`,
  MODULES: '/modules/',
  MODULE_BY_ID: (id: number) => `/modules/${id}/`,
};
