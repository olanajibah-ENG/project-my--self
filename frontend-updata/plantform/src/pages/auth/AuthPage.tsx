// src/pages/auth/AuthPage.tsx
import React from 'react';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import '../../components/auth/AuthForm.css';
import './AuthPage.css';
import { Link } from 'react-router-dom';

interface AuthPageProps {
    onAuthSuccess?: (role: 'instructor' | 'student') => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
    return (
        <div className="auth-wrapper-simple">
            <div className="auth-simple-container">
                <div className="auth-panel auth-panel-left">
                    <h2>تسجيل الدخول</h2>
                    <LoginForm onAuthSuccess={onAuthSuccess} />
                </div>

                <div className="auth-divider">أو</div>

                <div className="auth-panel auth-panel-right">
                    <h2>إنشاء حساب جديد</h2>
                    <RegisterForm onSuccess={() => alert('تم إنشاء الحساب. يرجى تسجيل الدخول.')} />
                    <div style={{ marginTop: 12 }}>
                        <Link to="/signup" className="ghost-link">فتح صفحة التسجيل الكاملة</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
