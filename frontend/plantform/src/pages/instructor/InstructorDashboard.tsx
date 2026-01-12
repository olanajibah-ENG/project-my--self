import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, BookOpen, Users, FileText, Pencil } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { courseService } from '@/services/course.service'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import type { Course } from '@/types'

export default function InstructorDashboard() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await courseService.getMyCourses()
        setCourses(data)
      } catch (err) {
        setError('Failed to load your courses')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMyCourses()
  }, [])

  // Calculate stats
  const totalCourses = courses.length
  const totalStudents = courses.reduce((sum, course) => sum + (course.enrolled_count || 0), 0)
  const totalLessons = courses.reduce((sum, course) => sum + (course.lessons_count || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Welcome section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your courses and track student progress
            </p>
          </div>
          <Link to="/instructor/courses/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Course
            </Button>
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Courses
              </CardTitle>
              <BookOpen className="h-5 w-5 text-brand-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Students
              </CardTitle>
              <Users className="h-5 w-5 text-brand-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Lessons
              </CardTitle>
              <FileText className="h-5 w-5 text-brand-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalLessons}</div>
            </CardContent>
          </Card>
        </div>

        {/* Course list */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
        ) : error ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        ) : courses.length === 0 ? (
          /* Empty state */
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No courses yet
              </h2>
              <p className="text-gray-600 mb-6">
                Create your first course to start teaching on OlaLearn.
              </p>
              <Link to="/instructor/courses/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Course
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <Card key={course.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.enrolled_count || 0} students
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {course.lessons_count || 0} lessons
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Link to={`/courses/${course.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View
                      </Button>
                    </Link>
                    <Link to={`/instructor/courses/${course.id}/edit`} className="flex-1">
                      <Button className="w-full">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
