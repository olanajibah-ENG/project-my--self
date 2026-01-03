import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AuthPage from './pages/auth/AuthPage';
import BooksPage from './pages/books/BooksPage';
import UserPage from './pages/user/UserPage';
import TransactionsPage from './pages/admin/TransactionsPage';
import './App.css';

function App() {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  console.log('App - isAuthenticated:', isAuthenticated);
  console.log('App - user:', user);
  console.log('App - user role:', user?.role);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.warn('Auth check failed:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [checkAuth]);

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <div className="App">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/auth"
            element={
              isAuthenticated ? (
                user?.role === 'admin' ? <Navigate to="/books" /> : <Navigate to="/user" />
              ) : (
                <AuthPage />
              )
            }
          />
          <Route
            path="/books"
            element={
              (() => {
                console.log('App - Books route check:', {
                  isAuthenticated,
                  userRole: user?.role,
                  shouldShowBooks: isAuthenticated && user?.role === 'admin'
                });
                return isAuthenticated && user?.role === 'admin' ? (
                  <BooksPage />
                ) : (
                  <Navigate to="/auth" />
                );
              })()
            }
          />
          <Route
            path="/transactions"
            element={
              isAuthenticated && user?.role === 'admin' ? (
                <TransactionsPage />
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route
            path="/user"
            element={
              isAuthenticated ? (
                <UserPage />
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route
            path="/user/borrows"
            element={
              isAuthenticated ? (
                <UserPage initialTab="borrowed" />
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route
            path="/"
            element={
              <Navigate to={
                isAuthenticated
                  ? (user?.role === 'admin' ? "/books" : "/user")
                  : "/auth"
              } />
            }
          />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
