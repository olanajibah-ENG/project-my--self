// =============================================================================
// 🔐 AUTH TYPES - Type definitions for Authentication
// =============================================================================
// 
// ⚠️ ISSUES FOUND:
// 1. User.id was defined as 'string' but Django returns a number
// 2. User interface expected fields that backend doesn't provide (isActive, createdAt, etc.)
// 3. AuthResponse assumed login and signup return the same structure - THEY DON'T!
//
// ✅ LESSON: Always check what your backend ACTUALLY returns!
//    Use Postman or browser DevTools to see the real response structure.
// =============================================================================

/**
 * User interface - represents the authenticated user
 * 
 * ⚠️ ISSUE: Original interface had fields that Django doesn't return:
 *    - isActive (Django has is_active but your view doesn't return it)
 *    - createdAt, updatedAt (Django has date_joined but your view doesn't return it)
 *    - role was required, but backend doesn't explicitly return it
 * 
 * ✅ FIX: Only include fields that your RegisterView actually returns:
 *    return Response({
 *        "user": {
 *            "id": user.id,        ← This is a NUMBER in Django!
 *            "username": user.username,
 *            "email": user.email
 *        }
 *    })
 */
export interface User {
  id: number;              // ⚠️ Changed from 'string' to 'number' - Django IDs are integers!
  username: string;
  email: string;
  role?: 'admin' | 'user'; // Optional - we determine this client-side from is_staff
}

/**
 * AuthState - the state of our authentication store
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * LoginCredentials - what we send to the login endpoint
 */
export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * RegisterCredentials - what we send to the signup endpoint
 */
export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;  // Only used client-side for validation
}

// =============================================================================
// ⚠️ IMPORTANT: LOGIN vs SIGNUP return DIFFERENT response structures!
// =============================================================================
// 
// Your backend has TWO different auth endpoints with DIFFERENT responses:
//
// 1. POST /api/auth/login/ (uses SimpleJWT's TokenObtainPairView)
//    Returns: { "access": "eyJ...", "refresh": "eyJ..." }
//
// 2. POST /api/auth/signup/ (uses your custom RegisterView)  
//    Returns: { "msg": "...", "user": {...}, "token": "...", "refresh_token": "..." }
//
// ❌ MISTAKE: Having one AuthResponse for both doesn't work!
// ✅ FIX: Create separate response types for each endpoint.
// =============================================================================

/**
 * LoginResponse - response from POST /api/auth/login/
 * 
 * This uses Django REST Framework SimpleJWT's default TokenObtainPairView,
 * which returns tokens with these field names: 'access' and 'refresh'
 */
export interface LoginResponse {
  access: string;   // ⚠️ Not 'token' - SimpleJWT uses 'access'!
  refresh: string;  // ⚠️ Not 'refreshToken' - SimpleJWT uses 'refresh'!
}

/**
 * SignupResponse - response from POST /api/auth/signup/
 * 
 * This uses your custom RegisterView which returns a different structure.
 * Look at your views.py line 18-27 to see exactly what's returned.
 */
export interface SignupResponse {
  msg: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  token: string;          // This is the access token
  refresh_token: string;  // ⚠️ snake_case! Your backend uses refresh_token, not refreshToken
}

/**
 * AuthError - structure for authentication errors
 */
export interface AuthError {
  message: string;
  code?: string;
  detail?: string;  // Django REST Framework often uses 'detail' for error messages
}

// =============================================================================
// 💡 LEARNING POINT: Why do we have different response structures?
// =============================================================================
// 
// - TokenObtainPairView is a BUILT-IN view from SimpleJWT library
//   It has its own fixed response format: { access, refresh }
//
// - RegisterView is YOUR CUSTOM view
//   You defined the response format yourself in views.py
//
// When using third-party libraries, always check their documentation
// to understand what response format they use!
// =============================================================================
