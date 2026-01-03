import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContainer } from '../../components/auth/AuthContainer';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    // Redirect to books page for testing
    console.log('Authentication successful!');
    // Temporary: Direct navigation for testing
    navigate('/books');
  };

  return <AuthContainer onSuccess={handleAuthSuccess} />;
};

export default AuthPage;
