import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useMyEnrollments } from '@/hooks/useEnrollment'
import { useProgress } from '@/hooks/useProgress'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import CourseCard from '@/components/course/CourseCard'

export default function StudentDashboard() {
  const { user } = useAuth()
  const { enrollments, isLoading } = useMyEnrollments()
  const { getProgress, completedLessons } = useProgress()

  // Find the most recent enrollment for "Continue Learning"
  const lastEnrollment = enrollments[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 mt-1">
            Continue your learning journey
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
        ) : enrollments.length === 0 ? (
          /* Empty state */
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No courses yet
              </h2>
              <p className="text-gray-600 mb-6">
                Start your learning journey by exploring our course catalog.
              </p>
              <Link to="/courses">
                <Button>
                  Explore Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Continue Learning */}
            {lastEnrollment?.course_details && (
              <Card className="mb-8 bg-gradient-to-r from-brand-50 to-brand-100 border-brand-200">
                <CardHeader>
                  <CardTitle className="text-lg text-brand-800">
                    Continue Learning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {lastEnrollment.course_details.title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {getProgress(lastEnrollment.course_details.lessons_count || 0)}% complete
                      </p>
                    </div>
                    <Link to={`/courses/${lastEnrollment.course}/learn`}>
                      <Button>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enrolled courses */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  My Courses
                </h2>
                <Link to="/courses" className="text-brand-600 hover:underline text-sm">
                  Browse more courses
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map(enrollment => (
                  enrollment.course_details && (
                    <CourseCard
                      key={enrollment.id}
                      course={enrollment.course_details}
                      progress={getProgress(enrollment.course_details.lessons_count || 0)}
                    />
                  )
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
