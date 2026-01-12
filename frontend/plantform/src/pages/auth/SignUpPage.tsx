// src/pages/auth/SignUpPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';
import PlantFormHeader from '../../components/PlantFormHeader';
import '../../components/auth/AuthForm.css';
import './SignUpPage.css';
import { Link } from 'react-router-dom';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/auth');
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <PlantFormHeader />

        <RegisterForm onSuccess={handleSuccess} />

        <div className="signup-footer">
          <span>Already have an account?</span>
          <Link to="/auth" className="ghost-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
