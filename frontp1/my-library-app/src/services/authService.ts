// =============================================================================
// 🔐 AUTH SERVICE - API calls for authentication
// =============================================================================
// 
// ⚠️ ISSUES FOUND:
// 1. Login and Signup were treated the same, but they return different structures!
// 2. Some endpoints (logout, profile, etc.) don't exist in your backend
//
// ✅ FIX: Handle the different response structures correctly
// =============================================================================

import api, { apiHelpers } from './api';
import type {
  LoginCredentials,
  RegisterCredentials,
  LoginResponse,
  SignupResponse
} from '../types/auth.types';

export const authService = {
  /**
   * Login user - POST /api/auth/login/
   * 
   * ⚠️ IMPORTANT: This endpoint uses SimpleJWT's TokenObtainPairView
   *    It returns: { access: "...", refresh: "..." }
   *    NOT: { token: "...", refreshToken: "..." }
   * 
   * 💡 TIP: Check library documentation for response formats!
   *    SimpleJWT docs: https://django-rest-framework-simplejwt.readthedocs.io/
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // ⚠️ SimpleJWT expects 'username' and 'password' fields
      const response = await api.post<LoginResponse>('/auth/login/', {
        username: credentials.username,
        password: credentials.password
      });
      return response.data;  // Returns { access, refresh }
    } catch (error) {
      throw new Error(apiHelpers.handleApiError(error));
    }
  },

  /**
   * Register new user - POST /api/auth/signup/
   * 
   * ⚠️ IMPORTANT: This uses YOUR custom RegisterView
   *    It returns: { msg, user, token, refresh_token }
   *    
   *    Notice: refresh_token (snake_case) not refreshToken (camelCase)!
   *    This is because Python/Django typically uses snake_case.
   */
  async register(credentials: RegisterCredentials): Promise<SignupResponse> {
    try {
      // Your backend only needs: username, email, password
      // confirmPassword is only for frontend validation
      const response = await api.post<SignupResponse>('/auth/signup/', {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password
      });
      return response.data;
    } catch (error) {
      throw new Error(apiHelpers.handleApiError(error));
    }
  },

  /**
   * Refresh token - POST /api/auth/token/refresh/
   * 
   * ⚠️ IMPORTANT: SimpleJWT refresh endpoint expects { refresh: "..." }
   *    and returns { access: "..." }
   */
  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    try {
      const response = await api.post('/auth/token/refresh/', {
        refresh: refreshToken  // ⚠️ Field name is 'refresh', not 'refreshToken'!
      });
      return response.data;
    } catch (error) {
      throw new Error(apiHelpers.handleApiError(error));
    }
  },

  /**
   * Logout user
   * 
   * ⚠️ NOTE: Your backend doesn't have a logout endpoint!
   *    For JWT, "logout" is typically done client-side by:
   *    1. Clearing tokens from storage
   *    2. Optionally: blacklisting the refresh token (requires SimpleJWT blacklist)
   */
  async logout(): Promise<void> {
    // JWT logout is typically client-side only
    // Just clear the tokens from storage
    console.log('Logout: Tokens will be cleared client-side');
    // If you add token blacklisting later, you can call the endpoint here
  }

  // =============================================================================
  // ⚠️ REMOVED ENDPOINTS: These don't exist in your backend!
  // =============================================================================
  // 
  // The original file had these methods, but your backend doesn't have them:
  //   - getCurrentUser()  → No /auth/me endpoint
  //   - updateProfile()   → No /auth/profile endpoint
  //   - changePassword()  → No /auth/change-password endpoint
  //   - requestPasswordReset() → No /auth/forgot-password endpoint
  //   - resetPassword()   → No /auth/reset-password endpoint
  //
  // 💡 LESSON: Don't write frontend code for APIs that don't exist yet!
  //    Either add these endpoints to your Django backend first,
  //    or remove these methods from the frontend.
  // =============================================================================
};
