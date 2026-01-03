const TOKEN_KEY = 'library_auth_token';
const REFRESH_TOKEN_KEY = 'library_refresh_token';
const USER_KEY = 'library_user_data';

export const tokenStorage = {
  setToken: (token: string): void => {
    try {
      // Validate token before saving
      if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
        console.error('❌ Invalid token provided:', token);
        localStorage.removeItem(TOKEN_KEY);
        return;
      }
      localStorage.setItem(TOKEN_KEY, token);
      console.log('✅ Token saved successfully, length:', token.length);
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  },

  getToken: (): string | null => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      
      // Validate token before returning
      if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
        console.warn('⚠️ Invalid token in storage:', token);
        localStorage.removeItem(TOKEN_KEY);
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  },

  setRefreshToken: (refreshToken: string): void => {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Failed to save refresh token:', error);
    }
  },

  getRefreshToken: (): string | null => {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  },

  setUser: (user: any): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  },

  getUser: (): any => {
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  },

  clearAll: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  },

  // Clean invalid tokens from storage
  cleanInvalidTokens: (): void => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && (token === 'undefined' || token === 'null' || token.trim() === '')) {
        console.warn('🧹 Cleaning invalid token from storage');
        localStorage.removeItem(TOKEN_KEY);
      }
      
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken && (refreshToken === 'undefined' || refreshToken === 'null' || refreshToken.trim() === '')) {
        console.warn('🧹 Cleaning invalid refresh token from storage');
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    } catch (error) {
      console.error('Failed to clean invalid tokens:', error);
    }
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Failed to check token expiration:', error);
      return true;
    }
  }
};
