import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../utils/tokenStorage';

// Clean invalid tokens on module load
tokenStorage.cleanInvalidTokens();

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getToken();

    // Validate token exists and is not invalid
    if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
      console.error('❌ Invalid or missing token for request:', {
        url: config.url,
        tokenValue: token,
        suggestion: 'Please login again to get a valid token'
      });
      return config; // Continue without token, let backend handle it
    }

    // Clean token - remove any existing prefix if present
    let cleanToken = token.trim();

    // Remove prefix if already present
    if (cleanToken.startsWith('Token ')) {
      cleanToken = cleanToken.substring(6);
    } else if (cleanToken.startsWith('Bearer ')) {
      cleanToken = cleanToken.substring(7);
    }

    // Final validation after cleaning
    if (!cleanToken || cleanToken === 'undefined' || cleanToken === 'null' || cleanToken.trim() === '') {
      console.error('❌ Token is invalid after cleaning:', cleanToken);
      return config;
    }

    // Check token format - if it's a JWT (has 3 parts separated by dots)
    const isJWT = cleanToken.split('.').length === 3;

    // Django REST Framework typically uses "Token" prefix
    // But some APIs use "Bearer" for JWT tokens
    // We'll try Token format first (most common for Django)
    const authHeader = isJWT ? `Bearer ${cleanToken}` : `Token ${cleanToken}`;

    config.headers.Authorization = authHeader;

    console.log('🔐 Auth Token Info:', {
      url: config.url,
      tokenLength: cleanToken.length,
      isJWT: isJWT,
      format: isJWT ? 'Bearer' : 'Token',
      tokenPreview: cleanToken.substring(0, 20) + '...'
    });

    // Log request details for POST/PUT requests
    if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
      console.log('📤 Request Details:', {
        url: config.url,
        method: config.method?.toUpperCase(),
        data: config.data,
        headers: {
          'Content-Type': config.headers['Content-Type'],
          'Authorization': config.headers.Authorization ? 'Present' : 'Missing'
        }
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If token is expired and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const currentToken = tokenStorage.getToken();
      const currentAuthHeader = originalRequest.headers.Authorization;

      console.error('❌ 401 Unauthorized Error:', {
        url: originalRequest.url,
        method: originalRequest.method,
        currentAuthFormat: currentAuthHeader?.substring(0, 10) || 'None',
        responseData: error.response?.data,
        tokenExists: !!currentToken
      });

      try {
        const refreshToken = tokenStorage.getRefreshToken();
        if (refreshToken) {
          console.log('🔄 Attempting token refresh...');
          // Attempt to refresh token
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refreshToken
          });

          const { token, refreshToken: newRefreshToken } = response.data;

          // Update stored tokens
          tokenStorage.setToken(token);
          if (newRefreshToken) {
            tokenStorage.setRefreshToken(newRefreshToken);
          }

          // Retry with new token
          const cleanToken = token.replace(/^(Token |Bearer )/, '');
          const isJWT = cleanToken.split('.').length === 3;
          const newAuthHeader = isJWT ? `Bearer ${cleanToken}` : `Token ${cleanToken}`;

          originalRequest.headers.Authorization = newAuthHeader;
          console.log('✅ Token refreshed, retrying request with:', newAuthHeader.substring(0, 15) + '...');
          return api(originalRequest);
        } else {
          // No refresh token, try alternative auth format
          if (currentToken) {
            const cleanToken = currentToken.replace(/^(Token |Bearer )/, '');
            const isJWT = cleanToken.split('.').length === 3;

            // If we used Token format, try Bearer (or vice versa)
            const currentFormat = currentAuthHeader?.startsWith('Bearer') ? 'Bearer' : 'Token';
            const alternativeFormat = currentFormat === 'Bearer' ? 'Token' : 'Bearer';
            const alternativeHeader = `${alternativeFormat} ${cleanToken}`;

            console.log(`🔄 Trying alternative auth format: ${alternativeFormat} (was ${currentFormat})`);
            originalRequest.headers.Authorization = alternativeHeader;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        console.error('❌ Token refresh failed:', refreshError);
        console.error('🔐 Clearing tokens and redirecting to login...');
        tokenStorage.clearAll();
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors (401 already handled above, but log if retry failed)
    if (error.response?.status === 401 && originalRequest._retry) {
      // Final 401 after retry - log detailed info
      console.error('❌ Final 401 Unauthorized (after retry):', {
        url: originalRequest.url,
        method: originalRequest.method,
        authHeader: originalRequest.headers.Authorization?.substring(0, 30) + '...',
        responseData: error.response?.data,
        responseStatus: error.response?.status,
        suggestion: 'Check if token is valid and backend expects correct format (Token vs Bearer)'
      });
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.error('Access forbidden:', error.response.data);
    } else if (error.response?.status === 404) {
      // Not found
      console.error('Resource not found:', error.response.data);
    } else if (error.response?.status && error.response.status >= 500) {
      // Server error
      console.error('Server error:', error.response.data);
    } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      // Network error
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Helper functions for common API patterns
export const apiHelpers = {
  // Retry mechanism for failed requests
  async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError!;
  },

  // Handle API errors consistently
  handleApiError(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    } else if (error.message) {
      return error.message;
    } else {
      return 'An unexpected error occurred';
    }
  },

  // Check if error is authentication related
  isAuthError(error: any): boolean {
    return error.response?.status === 401 || error.response?.status === 403;
  },

  // Check if error is network related
  isNetworkError(error: any): boolean {
    return error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED';
  }
};

export default api;
