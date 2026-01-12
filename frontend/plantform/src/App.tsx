import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

// Placeholder dashboards - will be replaced in Phase 3 & 4
function StudentDashboard() {
  const { user, logout } = useAuth()
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-brand-600">Student Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome, {user?.username}!</p>
      <button onClick={logout} className="mt-4 text-red-600 hover:underline">
        Logout
      </button>
    </div>
  )
}

function InstructorDashboard() {
  const { user, logout } = useAuth()
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-brand-600">Instructor Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome, {user?.username}!</p>
      <button onClick={logout} className="mt-4 text-red-600 hover:underline">
        Logout
      </button>
    </div>
  )
}

function Dashboard() {
  const { user } = useAuth()
  if (user?.role === 'instructor') {
    return <InstructorDashboard />
  }
  return <StudentDashboard />
}

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Redirects */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
