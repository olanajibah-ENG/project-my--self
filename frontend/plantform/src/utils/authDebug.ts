// src/utils/authDebug.ts

export const debugAuth = () => {
  console.log('🔍 Authentication Debug Info:');
  console.log('📍 Current URL:', window.location.href);
  
  const token = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('userRole');
  
  console.log('🔑 Token exists:', !!token);
  console.log('👤 User role:', userRole);
  
  if (token) {
    try {
      // فك تشفير JWT token للتحقق من محتواه
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('📋 Token payload:', payload);
      console.log('⏰ Token expires:', new Date(payload.exp * 1000));
      console.log('🕐 Current time:', new Date());
      console.log('✅ Token valid:', payload.exp * 1000 > Date.now());
    } catch (error) {
      console.error('❌ Error parsing token:', error);
    }
  }
  
  return {
    hasToken: !!token,
    userRole,
    tokenValid: token ? true : false // يمكن تحسين هذا لاحقاً
  };
};

export const checkAuthStatus = () => {
  const authInfo = debugAuth();
  
  if (!authInfo.hasToken) {
    console.warn('⚠️ No authentication token found');
    return false;
  }
  
  if (authInfo.userRole !== 'instructor') {
    console.warn('⚠️ User is not an instructor');
    return false;
  }
  
  return true;
};