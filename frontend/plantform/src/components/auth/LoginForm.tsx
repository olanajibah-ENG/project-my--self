// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

interface LoginFormProps {
  onAuthSuccess?: (role: 'instructor' | 'student') => void;
}

const LoginForm = ({ onAuthSuccess }: LoginFormProps) => {
    const [creds, setCreds] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!creds.username.trim() || !creds.password.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        setError('');
        
        try {
            const data = await authService.login(creds);
            
            if (!data || !data.role) {
                throw new Error('Invalid server response');
            }

            const userRole = data.role as 'instructor' | 'student';
            
            // authService بالفعل يحفظ البيانات في localStorage
            // لكن نتأكد من وجود accessToken
            const token = data.access || localStorage.getItem('accessToken');
            if (token && !localStorage.getItem('accessToken')) {
                localStorage.setItem('accessToken', token);
            }
            
            // Call the onAuthSuccess callback if provided
            if (onAuthSuccess) {
                onAuthSuccess(userRole);
            }
        } catch (err: any) {
            const errorMsg = err?.response?.data?.detail || 
                           err?.response?.data?.message || 
                           err?.message || 
                           'Invalid username or password';
            setError(errorMsg);
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="input-group">
                <FaUser className="input-icon" />
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={creds.username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setCreds({...creds, username: e.target.value});
                        if (error) setError('');
                    }} 
                    disabled={isLoading}
                    required 
                />
            </div>
            <div className="input-group password-group">
                <FaLock className="input-icon" />
                <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    value={creds.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setCreds({...creds, password: e.target.value});
                        if (error) setError('');
                    }} 
                    disabled={isLoading}
                    required 
                />
                <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading}
                >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
            <button 
                type="submit" 
                className="auth-btn"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <span className="btn-spinner"></span>
                        Loading...
                    </>
                ) : (
                    'Sign In'
                )}
            </button>
        </form>
    );
};
export default LoginForm;
