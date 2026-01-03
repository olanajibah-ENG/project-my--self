import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import './AuthContainer.css';

export type AuthMode = 'login' | 'register';

interface AuthContainerProps {
  initialMode?: AuthMode;
  onSuccess?: () => void;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({
  initialMode = 'login',
  onSuccess
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleModeSwitch = (newMode: AuthMode) => {
    if (newMode === mode) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setMode(newMode);
      setIsTransitioning(false);
    }, 150);
  };

  const handleAuthSuccess = () => {
    onSuccess?.();
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-gradient-1"></div>
        <div className="auth-gradient-2"></div>
        <div className="auth-gradient-3"></div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            {mode === 'login' ? 'Welcome Back' : 'Join Our Library'}
          </h1>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Sign in to access your account'
              : 'Create your account to start borrowing books'
            }
          </p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('login')}
            disabled={isTransitioning}
          >
            Login
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('register')}
            disabled={isTransitioning}
          >
            Register
          </button>
        </div>

        <div className={`auth-form-container ${isTransitioning ? 'transitioning' : ''}`}>
          {mode === 'login' ? (
            <LoginForm onSuccess={handleAuthSuccess} />
          ) : (
            <RegisterForm onSuccess={handleAuthSuccess} />
          )}
        </div>

        <div className="auth-footer">
          <p className="auth-footer-text">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              className="auth-link"
              onClick={() => handleModeSwitch(mode === 'login' ? 'register' : 'login')}
              disabled={isTransitioning}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
