// =============================================================================
// 🔐 AUTH STORE - Zustand store for authentication state management
// =============================================================================
// 
// ⚠️ ISSUES FOUND:
// 1. Login response handling assumed wrong field names (token vs access)
// 2. Mock login fallback confused the real auth flow
// 3. User role determination wasn't handled correctly
//
// ✅ KEY LESSON: Your backend has TWO different auth endpoints:
//    - /auth/login/  → Returns { access, refresh } (SimpleJWT)
//    - /auth/signup/ → Returns { msg, user, token, refresh_token } (custom)
// =============================================================================

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AuthState, LoginCredentials, RegisterCredentials, User } from '../types/auth.types';
import { authService } from '../services/authService';
import { tokenStorage } from '../utils/tokenStorage';

interface AuthStore extends AuthState {
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

        // =================================================================
        // LOGIN ACTION
        // =================================================================
        /**
         * ⚠️ CRITICAL FIX: SimpleJWT returns { access, refresh }
         *    NOT { token, refreshToken }!
         * 
         * Also, login doesn't return user info - we need to determine
         * the user from the JWT payload or make a separate API call.
         */
        login: async (credentials: LoginCredentials) => {
          set({ isLoading: true, error: null });
          console.log('AuthStore: Starting login for:', credentials.username);

          try {
            // Call the login endpoint
            const response = await authService.login(credentials);
            console.log('AuthStore: Login response:', response);

            // ✅ FIX: Use 'access' and 'refresh' - the actual JWT field names
            const accessToken = response.access;
            const refreshToken = response.refresh;

            // Validate tokens
            if (!accessToken || accessToken === 'undefined') {
              throw new Error('Invalid token received from server');
            }

            // Store tokens
            tokenStorage.setToken(accessToken);
            tokenStorage.setRefreshToken(refreshToken);

            // =============================================================
            // ⚠️ NOTE: LOGIN DOESN'T RETURN USER DATA!
            // =============================================================
            // SimpleJWT's TokenObtainPairView only returns tokens, not user info.
            // 
            // We have two options:
            // 1. Decode the JWT to get user_id (and maybe username)
            // 2. Make a separate API call to get user profile
            //
            // For now, we'll decode the JWT since that's simpler.
            // =============================================================

            // Decode JWT to get user info
            let user: User = {
              id: 0,
              username: credentials.username,
              email: '',
              role: 'user'  // Default until we read from JWT
            };

            try {
              // JWT has 3 parts: header.payload.signature
              // We decode the payload (middle part)
              const payload = JSON.parse(atob(accessToken.split('.')[1]));
              user.id = payload.user_id;

              // =============================================================
              // ⚠️ OLD CODE - This was the issue!
              // =============================================================
              // The original code just set role: 'user' for everyone because
              // the JWT didn't contain is_staff. Like this:
              //
              //   role: 'user'  // ❌ WRONG: Always 'user', even for admins!
              //
              // But now we've customized the backend's TokenObtainPairSerializer
              // to include is_staff in the JWT, so we can read it!
              // =============================================================

              // ✅ FIX: Read is_staff from JWT to determine role
              user.role = payload.is_staff ? 'admin' : 'user';
              user.username = payload.username || credentials.username;

              console.log('JWT decoded:', {
                user_id: payload.user_id,
                is_staff: payload.is_staff,
                role: user.role
              });
            } catch (e) {
              console.warn('Could not decode JWT payload:', e);
            }

            // Store user
            tokenStorage.setUser(user);

            set({
              user: user,
              token: accessToken,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            console.log('AuthStore: Login successful, user:', user);

          } catch (error: any) {
            console.error('AuthStore: Login failed:', error);
            set({
              isLoading: false,
              error: error.message || 'Login failed',
              isAuthenticated: false,
              user: null,
              token: null
            });
            throw error;
          }
        },

        // =================================================================
        // REGISTER ACTION
        // =================================================================
        /**
         * ⚠️ CRITICAL FIX: Signup returns different structure than login!
         *    { msg, user, token, refresh_token }
         *    
         *    Note: refresh_token (snake_case) not refreshToken (camelCase)
         */
        register: async (credentials: RegisterCredentials) => {
          set({ isLoading: true, error: null });

          try {
            const response = await authService.register(credentials);
            console.log('AuthStore: Register response:', response);

            // ✅ FIX: Use the actual field names from your RegisterView
            const accessToken = response.token;
            const refreshToken = response.refresh_token;  // ⚠️ snake_case!

            // Validate
            if (!accessToken) {
              throw new Error('Invalid token received from server');
            }

            // Build user object from response
            const user: User = {
              id: response.user.id,
              username: response.user.username,
              email: response.user.email,
              role: 'user'  // New users are not admins by default
            };

            // Store everything
            tokenStorage.setToken(accessToken);
            tokenStorage.setRefreshToken(refreshToken);
            tokenStorage.setUser(user);

            set({
              user: user,
              token: accessToken,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            console.log('AuthStore: Registration successful');

          } catch (error: any) {
            console.error('AuthStore: Registration failed:', error);
            set({
              isLoading: false,
              error: error.message || 'Registration failed'
            });
            throw error;
          }
        },

        // =================================================================
        // LOGOUT ACTION
        // =================================================================
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

        // =================================================================
        // CHECK AUTH - Verify if user is still authenticated
        // =================================================================
        checkAuth: async () => {
          const token = tokenStorage.getToken();
          const user = tokenStorage.getUser();

          console.log('AuthStore: checkAuth - Token:', token ? 'Present' : 'Missing');

          if (!token || !user) {
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

        // =================================================================
        // REFRESH TOKEN
        // =================================================================
        refreshToken: async () => {
          try {
            const currentRefresh = tokenStorage.getRefreshToken();
            if (!currentRefresh) {
              throw new Error('No refresh token available');
            }

            const response = await authService.refreshToken(currentRefresh);

            // ✅ FIX: SimpleJWT refresh returns { access } not { token }
            tokenStorage.setToken(response.access);
            set({ token: response.access });

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

// =============================================================================
// 💡 LEARNING POINTS:
// =============================================================================
// 
// 1. DIFFERENT RESPONSES: Login and Signup return different structures!
//    Always check your backend to see what each endpoint returns.
//
// 2. FIELD NAMING: Python uses snake_case, JavaScript uses camelCase.
//    But when receiving JSON from Python backend, you get snake_case!
//    { refresh_token: "..." } not { refreshToken: "..." }
//
// 3. JWT DECODING: You can decode a JWT to read the payload:
//    JSON.parse(atob(token.split('.')[1]))
//    This gives you {user_id, exp, iat, ...}
//
// 4. REMOVED MOCK DATA: The original store had mock login fallback.
//    This hides real errors! If backend is down, you should see the error.
// =============================================================================
