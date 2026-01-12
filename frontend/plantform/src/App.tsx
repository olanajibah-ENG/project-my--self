import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

// Auth pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

// Student pages
import StudentDashboard from '@/pages/student/StudentDashboard'
import CourseCatalog from '@/pages/student/CourseCatalog'
import CourseDetail from '@/pages/student/CourseDetail'
import LearningView from '@/pages/student/LearningView'

// Instructor pages
import InstructorDashboard from '@/pages/instructor/InstructorDashboard'
import CourseBuilder from '@/pages/instructor/CourseBuilder'
import CreateCourse from '@/pages/instructor/CreateCourse'

// Role-based Dashboard component
function Dashboard() {
  const { user } = useAuth()
  if (user?.role === 'instructor') {
    return <InstructorDashboard />
  }
  return <StudentDashboard />
}

// Protected route wrapper for instructor-only routes
function InstructorRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  if (user?.role !== 'instructor') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
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

      {/* Protected student routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <CourseCatalog />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:id"
        element={
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:id/learn"
        element={
          <ProtectedRoute>
            <LearningView />
          </ProtectedRoute>
        }
      />

      {/* Protected instructor routes */}
      <Route
        path="/instructor/dashboard"
        element={
          <ProtectedRoute>
            <InstructorRoute>
              <InstructorDashboard />
            </InstructorRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/new"
        element={
          <ProtectedRoute>
            <InstructorRoute>
              <CreateCourse />
            </InstructorRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:id/edit"
        element={
          <ProtectedRoute>
            <InstructorRoute>
              <CourseBuilder />
            </InstructorRoute>
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
