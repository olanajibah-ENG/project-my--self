import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import './AuthForm.css';

export const LoginForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);

  // استخدام authStore بدلاً من state محلي
  const { login, isLoading, error } = useAuthStore();

  // 1. إضافة State لتخزين البيانات والرسائل
  const [username, setUsername] = useState(''); // الباك عندك يستخدم username للدخول
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // استخدام authStore.login بدلاً من authService.login المباشر
      await login({ username, password });

      console.log('Login Success!');
      alert("تم تسجيل الدخول بنجاح!");
      onSuccess?.();
    } catch (err: any) {
      console.error('Login failed:', err);
      // الخطأ سيتم التعامل معه من قبل authStore
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label className="form-label">Username</label>
        <div className="input-container">
          <Mail className="input-icon" size={20} />
          <input
            type="text"
            className="form-input"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <div className="input-container">
          <Lock className="input-icon" size={20} />
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* عرض رسالة الخطأ هنا */}
      {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

      <button type="submit" className="auth-submit-btn" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};