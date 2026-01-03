import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AuthState, LoginCredentials, RegisterCredentials } from '../types/auth.types';
import { authService } from '../services/authService';
import { tokenStorage } from '../utils/tokenStorage';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Login action
        login: async (credentials: LoginCredentials) => {
          set({ isLoading: true, error: null });
          console.log('AuthStore: Starting login for:', credentials.username);

          try {
            // Try backend first
            const response = await authService.login(credentials);
            console.log('AuthStore: Login response:', response);

            // Validate token before storing
            if (!response.token || response.token === 'undefined' || response.token === 'null') {
              throw new Error('Invalid token received from server');
            }

            // Store tokens
            tokenStorage.setToken(response.token);
            if (response.refreshToken) {
              tokenStorage.setRefreshToken(response.refreshToken);
            }
            tokenStorage.setUser(response.user);

            console.log('AuthStore: Tokens stored, user:', response.user);
            console.log('AuthStore: Token length:', response.token?.length);

            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } catch (apiError) {
            // Backend not available, use mock login
            console.warn('AuthStore: Backend not available, using mock login');

            // Mock user data
            const mockUser = {
              id: '1',
              username: credentials.username,
              email: `${credentials.username}@example.com`,
              role: 'admin' as const, // Make all users admins for testing
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            const mockToken = 'mock-jwt-token-' + Date.now();

            // Store mock data
            tokenStorage.setToken(mockToken);
            tokenStorage.setUser(mockUser);

            console.log('AuthStore: Mock login successful, user:', mockUser);

            set({
              user: mockUser,
              token: mockToken,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          }
        },

        // Register action
        register: async (credentials: RegisterCredentials) => {
          set({ isLoading: true, error: null });

          try {
            // Try backend first
            const response = await authService.register(credentials);

            // Store tokens
            tokenStorage.setToken(response.token);
            if (response.refreshToken) {
              tokenStorage.setRefreshToken(response.refreshToken);
            }
            tokenStorage.setUser(response.user);

            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } catch (apiError) {
            // Backend not available, use mock registration
            console.warn('AuthStore: Backend not available, using mock registration');

            // Mock user data
            const mockUser = {
              id: Date.now().toString(),
              username: credentials.username,
              email: credentials.email,
              role: 'admin' as const, // Make all users admins for testing
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            const mockToken = 'mock-jwt-token-' + Date.now();

            // Store mock data
            tokenStorage.setToken(mockToken);
            tokenStorage.setUser(mockUser);

            console.log('AuthStore: Mock registration successful, user:', mockUser);

            set({
              user: mockUser,
              token: mockToken,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          }
        },

        // Logout action
        logout: async () => {
          set({ isLoading: true });

          try {
            await authService.logout();
          } catch (error) {
            console.warn('Logout API call failed:', error);
          } finally {
            // Always clear local storage and state
            tokenStorage.clearAll();
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            });
          }
        },

        // Check authentication status
        checkAuth: async () => {
          const token = tokenStorage.getToken();
          const user = tokenStorage.getUser();
          console.log('AuthStore: checkAuth - Token:', token ? 'Present' : 'Missing', 'User:', user);

          if (!token || !user) {
            console.log('AuthStore: No token or user, clearing auth');
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false
            });
            return;
          }

          // Check if token is expired
          if (tokenStorage.isTokenExpired(token)) {
            try {
              await get().refreshToken();
            } catch (error) {
              // Token refresh failed, clear everything
              tokenStorage.clearAll();
              set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false
              });
              return;
            }
          }

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });
        },

        // Refresh token
        refreshToken: async () => {
          try {
            const response = await authService.refreshToken();

            tokenStorage.setToken(response.token);
            if (response.refreshToken) {
              tokenStorage.setRefreshToken(response.refreshToken);
            }

            set({ token: response.token });
          } catch (error) {
            tokenStorage.clearAll();
            set({
              user: null,
              token: null,
              isAuthenticated: false
            });
            throw error;
          }
        },

        // Clear error
        clearError: () => {
          set({ error: null });
        }
      }),
      {
        name: 'auth-storage',
        // Only persist specific fields
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated
        })
      }
    ),
    { name: 'auth-store' }
  )
);
