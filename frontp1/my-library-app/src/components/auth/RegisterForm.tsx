import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import './AuthForm.css';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error } = useAuthStore();

  // --- (هنا الشغل الجديد) ---
  // إنشاء مخزن لكل قيمة في الفورم
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // التأكد أن كلمة السر متطابقة قبل الإرسال
    if (password !== confirmPassword) {
      setLocalError('كلمات المرور غير متطابقة');
      return;
    }

    try {
      // استخدام authStore.register بدلاً من authService.register المباشر
      await register({
        username: username,
        email: email,
        password: password,
        confirmPassword: confirmPassword
      });

      // إذا وصلنا هنا، يعني الباك إند رد علينا بـ 201 (تم الإنشاء) كما في الصورة
      alert("تم إنشاء الحساب بنجاح!");
      onSuccess?.(); // نخبر الصفحة الرئيسية أن النجاح تم لتنقله لصفحة أخرى

    } catch (err: any) {
      // إذا حدث خطأ (مثلاً الإيميل مستخدم من قبل)، نعرض الرسالة
      console.error('Registration failed:', err);
      // الخطأ سيتم التعامل معه من قبل authStore
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {/* حقل اليوزرنيم */}
      <div className="form-group">
        <label className="form-label">Username</label>
        <div className="input-container">
          <User className="input-icon" size={20} />
          <input
            type="text"
            className="form-input"
            placeholder="Choose a username"
            value={username} // ربط القيمة بالمخزن
            onChange={(e) => setUsername(e.target.value)} // تحديث المخزن عند الكتابة
            required
          />
        </div>
      </div>

      {/* حقل الإيميل */}
      <div className="form-group">
        <label className="form-label">Email Address</label>
        <div className="input-container">
          <Mail className="input-icon" size={20} />
          <input
            type="email"
            className="form-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      {/* حقل الباسورد */}
      <div className="form-group">
        <label className="form-label">Password</label>
        <div className="input-container">
          <Lock className="input-icon" size={20} />
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-input"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* حقل تأكيد الباسورد */}
      <div className="form-group">
        <label className="form-label">Confirm Password</label>
        <div className="input-container">
          <Lock className="input-icon" size={20} />
          <input
            type="password"
            className="form-input"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      </div>
      {/* عرض رسالة الخطأ للمستخدم في p tag */}
      {(localError || error) && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>{localError || error}</p>}

      <button type="submit" className="auth-submit-btn" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
};