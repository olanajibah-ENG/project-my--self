import React from 'react';
import LoginForm from '../../components/auth/LoginForm';
import PlantFormHeader from '../../components/PlantFormHeader';
import '../../components/auth/AuthForm.css';
import './SignInPage.css';
import { Link } from 'react-router-dom';

interface SignInPageProps {
  onAuthSuccess?: (role: 'instructor' | 'student') => void;
}

const SignInPage: React.FC<SignInPageProps> = ({ onAuthSuccess }) => {
  return (
    <div className="signin-page">
      <div className="signin-card">
        <PlantFormHeader />
        
        <LoginForm onAuthSuccess={onAuthSuccess} />

        <footer className="signin-footer">
          <span>Don't have an account?</span>
          <Link to="/signup" className="ghost-link">Create one</Link>
        </footer>
      </div>
    </div>
  );
};

export default SignInPage;
