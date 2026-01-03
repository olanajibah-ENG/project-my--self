import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
    clearError
  } = useAuthStore();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,

    // Computed properties
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',

    // Actions
    login,
    register,
    logout,
    checkAuth,
    clearError,

    // Helpers
    hasPermission: (requiredRole?: 'admin' | 'user') => {
      if (!requiredRole) return isAuthenticated;
      return isAuthenticated && user?.role === requiredRole;
    },

    requiresAuth: () => {
      if (!isAuthenticated && !isLoading) {
        // You could redirect here or handle differently
        return false;
      }
      return true;
    }
  };
};
