import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle, Menu } from 'lucide-react'
import { useCourse } from '@/hooks/useCourses'
import { useProgress } from '@/hooks/useProgress'
import { Button } from '@/components/ui/button'
import Header from '@/components/layout/Header'
import LessonSidebar from '@/components/lesson/LessonSidebar'
import VideoPlayer from '@/components/lesson/VideoPlayer'
import MarkdownReader from '@/components/lesson/MarkdownReader'
import type { Lesson } from '@/types'

export default function LearningView() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const courseId = id ? parseInt(id) : null

  const { course, isLoading } = useCourse(courseId)
  const { completedLessons, markComplete, isComplete } = useProgress()

  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Get all lessons in order
  const allLessons = course?.modules?.flatMap(m => m.lessons || []) || []

  // Get lesson from URL or default to first
  useEffect(() => {
    if (allLessons.length > 0) {
      const lessonId = searchParams.get('lesson')
      if (lessonId) {
        const lesson = allLessons.find(l => l.id === parseInt(lessonId))
        if (lesson) {
          setCurrentLesson(lesson)
          return
        }
      }
      // Default to first lesson
      setCurrentLesson(allLessons[0])
      setSearchParams({ lesson: allLessons[0].id.toString() })
    }
  }, [allLessons, searchParams, setSearchParams])

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson)
    setSearchParams({ lesson: lesson.id.toString() })
  }

  const handleMarkComplete = async () => {
    if (currentLesson) {
      await markComplete(currentLesson.id)
    }
  }

  const currentIndex = currentLesson ? allLessons.findIndex(l => l.id === currentLesson.id) : -1
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  // Find current module
  const currentModule = course?.modules?.find(m =>
    m.lessons?.some(l => l.id === currentLesson?.id)
  )
  const lessonIndexInModule = currentModule?.lessons?.findIndex(l => l.id === currentLesson?.id) ?? 0

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex relative">
        {course?.modules && (
          <LessonSidebar
            modules={course.modules}
            currentLessonId={currentLesson?.id || null}
            completedLessons={completedLessons}
            onLessonSelect={(lesson) => {
              handleLessonSelect(lesson)
              setIsSidebarOpen(false)
            }}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden mb-4 flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="h-5 w-5" />
            <span>Course Content</span>
          </button>
          {currentLesson ? (
            <div className="max-w-4xl mx-auto">
              {/* Progress indicator */}
              <div className="text-sm text-gray-500 mb-4">
                {currentModule?.title} • Lesson {lessonIndexInModule + 1} of {currentModule?.lessons?.length || 0}
              </div>

              {/* Lesson title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                {currentLesson.title}
              </h1>

              {/* Video content */}
              {currentLesson.video_file && (
                <div className="mb-8">
                  <VideoPlayer
                    src={currentLesson.video_file}
                    title={currentLesson.title}
                  />
                </div>
              )}

              {/* Markdown content */}
              {currentLesson.content_markdown && (
                <div className="mb-8">
                  <MarkdownReader content={currentLesson.content_markdown} />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t">
                <div className="flex gap-2">
                  {prevLesson && (
                    <Button
                      variant="outline"
                      onClick={() => handleLessonSelect(prevLesson)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  {!isComplete(currentLesson.id) ? (
                    <Button onClick={handleMarkComplete}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  ) : (
                    <span className="flex items-center text-brand-600 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completed
                    </span>
                  )}

                  {nextLesson && (
                    <Button onClick={() => handleLessonSelect(nextLesson)}>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No lesson selected</p>
              <Link to={`/courses/${courseId}`} className="text-brand-600 hover:underline mt-2 inline-block">
                Back to course
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
