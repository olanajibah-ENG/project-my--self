import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, BookOpen, Users } from 'lucide-react'
import { useCourse } from '@/hooks/useCourses'
import { useEnrollment } from '@/hooks/useEnrollment'
import { useProgress } from '@/hooks/useProgress'
import { Button } from '@/components/ui/button'
import Header from '@/components/layout/Header'
import CurriculumOutline from '@/components/course/CurriculumOutline'

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>()
  const courseId = id ? parseInt(id) : null
  const navigate = useNavigate()

  const { course, isLoading: courseLoading, error } = useCourse(courseId)
  const { isEnrolled, isLoading: enrollmentLoading, isEnrolling, enroll } = useEnrollment(courseId)
  const { completedLessons, getProgressForCourse } = useProgress()

  const isLoading = courseLoading || enrollmentLoading

  const totalLessons = course?.modules?.reduce(
    (acc, m) => acc + (m.lessons?.length || 0),
    0
  ) || 0

  const handleEnroll = async () => {
    await enroll()
  }

  const handleContinue = () => {
    navigate(`/courses/${courseId}/learn`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-600">{error || 'Course not found'}</p>
          <Link to="/courses" className="text-brand-600 hover:underline mt-4 inline-block">
            Back to courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          to="/courses"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to courses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {course.title}
            </h1>

            {course.instructor_name && (
              <p className="text-gray-600 mb-4">
                By {course.instructor_name}
              </p>
            )}

            <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {totalLessons} lessons
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {course.modules?.length || 0} modules
              </span>
              {course.enrolled_count !== undefined && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.enrolled_count} students
                </span>
              )}
            </div>

            <div className="prose max-w-none mb-8">
              <h2 className="text-xl font-semibold mb-3">About this course</h2>
              <p className="text-gray-600">{course.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Curriculum</h2>
              {course.modules && course.modules.length > 0 ? (
                <CurriculumOutline
                  modules={course.modules}
                  completedLessons={completedLessons}
                />
              ) : (
                <p className="text-gray-500">No modules available yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-xl border p-6">
              {course.is_owner ? (
                <>
                  <p className="text-gray-600 mb-4">
                    You are the instructor of this course
                  </p>
                  <Link to={`/instructor/courses/${courseId}/edit`}>
                    <Button className="w-full">
                      Edit Course
                    </Button>
                  </Link>
                </>
              ) : isEnrolled ? (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Your progress</span>
                      <span>{getProgressForCourse(
                        course?.modules?.flatMap(m => m.lessons?.map(l => l.id) || []) || [],
                        totalLessons
                      )}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-600 transition-all"
                        style={{ width: `${getProgressForCourse(
                          course?.modules?.flatMap(m => m.lessons?.map(l => l.id) || []) || [],
                          totalLessons
                        )}%` }}
                      />
                    </div>
                  </div>
                  <Button onClick={handleContinue} className="w-full">
                    Continue Learning
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Enroll in this course to start learning
                  </p>
                  <Button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full"
                  >
                    {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
