import api, { apiHelpers } from './api';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth.types';

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login/', credentials);
      return response.data;
    } catch (error) {
      throw new Error(apiHelpers.handleApiError(error));
    }
  },

  // Register new user
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/signup/', credentials);
      return response.data;
    } catch (error) {
      throw new Error(apiHelpers.handleApiError(error));
    }
  },

  // Refresh token
  async refreshToken(): Promise<{ token: string; refreshToken?: string }> {
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error) {
      throw new Error(apiHelpers.handleApiError(error));
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, we clear local storage
      console.warn('Server logout failed:', error);
    }
  },

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(apiHelpers.handleApiError(error));
    }
  },

  // Update user profile
  async updateProfile(userData: Partial<{ username: string; email: string }>) {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      throw new Error(apiHelpers.handleApiError(error));
    }
  },

  // Change password
  async changePassword(data: { currentPassword: string; newPassword: string }) {
    try {
      const response = await api.put('/auth/change-password', data);
      return response.data;
    } catch (error) {
      throw new Error(apiHelpers.handleApiError(error));
    }
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error) {
      throw new Error(apiHelpers.handleApiError(error));
    }
  },

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
    } catch (error) {
      throw new Error(apiHelpers.handleApiError(error));
    }
  }
};
