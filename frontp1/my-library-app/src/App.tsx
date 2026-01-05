// =============================================================================
// 🚀 APP - Main routing component
// =============================================================================
// 
// ⚠️ ISSUES FIXED:
// 1. /books was admin-only - now accessible by all users
// 2. /auth redirected non-admins to /user - now all go to /books
// 3. BooksPage handles both admin and user views
// =============================================================================

import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AuthPage from './pages/auth/AuthPage';
import BooksPage from './pages/books/BooksPage';
import TransactionsPage from './pages/admin/TransactionsPage';
import './App.css';

function App() {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
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

  // Loading screen
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

  const isAdmin = user?.role === 'admin';

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* ✅ Auth page - redirect to /books if already logged in */}
          <Route
            path="/auth"
            element={
              isAuthenticated ? <Navigate to="/books" /> : <AuthPage />
            }
          />

          {/* ✅ FIXED: Books page - accessible by ALL authenticated users */}
          <Route
            path="/books"
            element={
              isAuthenticated ? <BooksPage /> : <Navigate to="/auth" />
            }
          />

          {/* Transactions - Admin only */}
          <Route
            path="/transactions"
            element={
              isAuthenticated && isAdmin ? (
                <TransactionsPage />
              ) : (
                <Navigate to="/auth" />
              )
            }
          />

          {/* ✅ Default - send everyone to /books */}
          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated ? "/books" : "/auth"} />
            }
          />

          {/* Catch-all - redirect to /books or /auth */}
          <Route
            path="*"
            element={
              <Navigate to={isAuthenticated ? "/books" : "/auth"} />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

// =============================================================================
// 💡 ROUTING CHANGES:
// =============================================================================
// 
// ⚠️ OLD ROUTING (problematic):
//    - /books only for admins
//    - /user for regular users (separate page)
//    - Multiple redirects to different pages
// 
// ✅ NEW ROUTING (simplified):
//    - /books for ALL authenticated users
//    - BooksPage handles both admin and user views
//    - Admin sees: Add/Edit/Delete buttons
//    - User sees: Borrow button, My Borrows tab
//    - /transactions remains admin-only
// =============================================================================
