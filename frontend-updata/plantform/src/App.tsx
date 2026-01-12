// App.tsx
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import { InstructorDashboard } from './pages/instructor/InstructorDashboard';
import { StudentDashboard } from './pages/student/StudentDashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'instructor' | 'student' | null>(null);
  const [isLoading] = useState(false);

  const handleAuthSuccess = (role: 'instructor' | 'student') => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Auth Route */}
          <Route
            path="/auth"
            element={
              !isAuthenticated ? (
                <SignInPage onAuthSuccess={handleAuthSuccess} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated && userRole === 'instructor' ? (
                <InstructorDashboard onLogout={handleLogout} />
              ) : isAuthenticated && userRole === 'student' ? (
                <StudentDashboard />
              ) : isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          {/* Default Route */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          {/* Standalone Signup Route */}
          <Route path="/signup" element={<SignUpPage />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
