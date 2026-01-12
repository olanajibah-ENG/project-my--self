import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Check, X, Menu } from 'lucide-react'
import { courseService } from '@/services/course.service'
import { moduleService, type CreateModuleData } from '@/services/module.service'
import { lessonService, type CreateLessonData } from '@/services/lesson.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ModulePanel from '@/components/instructor/ModulePanel'
import LessonEditor from '@/components/instructor/LessonEditor'
import type { Course, Module, Lesson } from '@/types'

type ModuleWithLessons = Module & { lessons?: Lesson[] }

export default function CourseBuilder() {
  const { courseId } = useParams<{ courseId: string }>()
  const id = courseId ? parseInt(courseId) : null

  // Course state
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<ModuleWithLessons[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Selection state
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)

  // Editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [isSavingTitle, setIsSavingTitle] = useState(false)
  const [isSavingLesson, setIsSavingLesson] = useState(false)

  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Fetch course data
  const fetchCourseData = useCallback(async () => {
    if (!id) return

    try {
      setIsLoading(true)
      setError(null)

      // Fetch course - it includes modules with lessons from the backend serializer
      const courseData = await courseService.getCourse(id)

      setCourse(courseData)

      // Use modules from course response, or empty array if none
      const modulesWithLessons = (courseData.modules || []).map(module => ({
        ...module,
        lessons: module.lessons || []
      }))

      setModules(modulesWithLessons)
    } catch (err) {
      setError('Failed to load course data')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchCourseData()
  }, [fetchCourseData])

  // Course title editing
  const startEditingTitle = () => {
    if (course) {
      setEditedTitle(course.title)
      setIsEditingTitle(true)
    }
  }

  const saveTitle = async () => {
    if (!course || !editedTitle.trim()) return

    setIsSavingTitle(true)
    try {
      const updated = await courseService.updateCourse(course.id, {
        title: editedTitle.trim()
      })
      setCourse(updated)
      setIsEditingTitle(false)
    } catch (err) {
      console.error('Failed to update course title:', err)
    } finally {
      setIsSavingTitle(false)
    }
  }

  const cancelEditingTitle = () => {
    setIsEditingTitle(false)
    setEditedTitle('')
  }

  // Module handlers
  const handleAddModule = async () => {
    if (!id) return

    const maxOrder = modules.length > 0
      ? Math.max(...modules.map(m => m.order))
      : -1

    const newModule: CreateModuleData = {
      title: 'New Module',
      description: '',
      order: maxOrder + 1
    }

    try {
      const created = await moduleService.createModule(id, newModule)
      setModules(prev => [...prev, { ...created, lessons: [] }])
      setSelectedModule(created)
      setSelectedLesson(null)
    } catch (err) {
      console.error('Failed to create module:', err)
    }
  }

  const handleEditModule = async (module: Module) => {
    try {
      const updated = await moduleService.updateModule(module.id, {
        title: module.title,
        description: module.description
      })
      setModules(prev =>
        prev.map(m => m.id === updated.id ? { ...m, ...updated } : m)
      )
    } catch (err) {
      console.error('Failed to update module:', err)
    }
  }

  const handleDeleteModule = async (moduleId: number) => {
    try {
      await moduleService.deleteModule(moduleId)
      setModules(prev => prev.filter(m => m.id !== moduleId))

      // Clear selection if deleted module/lesson was selected
      if (selectedModule?.id === moduleId) {
        setSelectedModule(null)
        setSelectedLesson(null)
      }
    } catch (err) {
      console.error('Failed to delete module:', err)
    }
  }

  const handleMoveModule = async (moduleId: number, direction: 'up' | 'down') => {
    const sortedModules = [...modules].sort((a, b) => a.order - b.order)
    const currentIndex = sortedModules.findIndex(m => m.id === moduleId)

    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sortedModules.length - 1)
    ) {
      return
    }

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const currentModule = sortedModules[currentIndex]
    const swapModule = sortedModules[swapIndex]

    // Swap orders
    const updatedModules = modules.map(m => {
      if (m.id === currentModule.id) {
        return { ...m, order: swapModule.order }
      }
      if (m.id === swapModule.id) {
        return { ...m, order: currentModule.order }
      }
      return m
    })

    setModules(updatedModules)

    // Persist to backend
    try {
      await Promise.all([
        moduleService.updateModule(currentModule.id, { order: swapModule.order }),
        moduleService.updateModule(swapModule.id, { order: currentModule.order })
      ])
    } catch (err) {
      console.error('Failed to reorder modules:', err)
      // Revert on error
      fetchCourseData()
    }
  }

  // Lesson handlers
  const handleAddLesson = async (moduleId: number) => {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return

    const maxOrder = module.lessons && module.lessons.length > 0
      ? Math.max(...module.lessons.map(l => l.order))
      : -1

    const newLesson: CreateLessonData = {
      title: 'New Lesson',
      content_markdown: '',
      order: maxOrder + 1
    }

    try {
      const created = await lessonService.createLesson(moduleId, newLesson)
      setModules(prev =>
        prev.map(m =>
          m.id === moduleId
            ? { ...m, lessons: [...(m.lessons || []), created] }
            : m
        )
      )
      setSelectedLesson(created)
      setSelectedModule(module)
    } catch (err) {
      console.error('Failed to create lesson:', err)
    }
  }

  const handleDeleteLesson = async (lessonId: number) => {
    try {
      await lessonService.deleteLesson(lessonId)
      setModules(prev =>
        prev.map(m => ({
          ...m,
          lessons: m.lessons?.filter(l => l.id !== lessonId)
        }))
      )

      // Clear selection if deleted lesson was selected
      if (selectedLesson?.id === lessonId) {
        setSelectedLesson(null)
      }
    } catch (err) {
      console.error('Failed to delete lesson:', err)
    }
  }

  const handleMoveLesson = async (lessonId: number, moduleId: number, direction: 'up' | 'down') => {
    const module = modules.find(m => m.id === moduleId)
    if (!module?.lessons) return

    const sortedLessons = [...module.lessons].sort((a, b) => a.order - b.order)
    const currentIndex = sortedLessons.findIndex(l => l.id === lessonId)

    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sortedLessons.length - 1)
    ) {
      return
    }

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const currentLesson = sortedLessons[currentIndex]
    const swapLesson = sortedLessons[swapIndex]

    // Swap orders locally
    const updatedModules = modules.map(m => {
      if (m.id !== moduleId) return m
      return {
        ...m,
        lessons: m.lessons?.map(l => {
          if (l.id === currentLesson.id) {
            return { ...l, order: swapLesson.order }
          }
          if (l.id === swapLesson.id) {
            return { ...l, order: currentLesson.order }
          }
          return l
        })
      }
    })

    setModules(updatedModules)

    // Persist to backend
    try {
      await Promise.all([
        lessonService.updateLesson(currentLesson.id, { order: swapLesson.order }),
        lessonService.updateLesson(swapLesson.id, { order: currentLesson.order })
      ])
    } catch (err) {
      console.error('Failed to reorder lessons:', err)
      // Revert on error
      fetchCourseData()
    }
  }

  const handleSaveLesson = async (lesson: Lesson) => {
    setIsSavingLesson(true)
    try {
      const updated = await lessonService.updateLesson(lesson.id, {
        title: lesson.title,
        content_markdown: lesson.content_markdown
      })

      // Update in modules state
      setModules(prev =>
        prev.map(m => ({
          ...m,
          lessons: m.lessons?.map(l =>
            l.id === updated.id ? { ...l, ...updated } : l
          )
        }))
      )

      // Update selected lesson
      setSelectedLesson(updated)
    } catch (err) {
      console.error('Failed to save lesson:', err)
      throw err
    } finally {
      setIsSavingLesson(false)
    }
  }

  const handleUploadVideo = async (lessonId: number, file: File) => {
    try {
      const updated = await lessonService.uploadVideo(lessonId, file)

      // Update in modules state
      setModules(prev =>
        prev.map(m => ({
          ...m,
          lessons: m.lessons?.map(l =>
            l.id === updated.id ? { ...l, ...updated } : l
          )
        }))
      )

      // Update selected lesson if it's the one being updated
      if (selectedLesson?.id === lessonId) {
        setSelectedLesson(updated)
      }
    } catch (err) {
      console.error('Failed to upload video:', err)
      alert('Failed to upload video. Please try again.')
    }
  }

  const handleSelectModule = (module: Module) => {
    setSelectedModule(module)
    setSelectedLesson(null)
  }

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    // Also select the parent module
    const parentModule = modules.find(m =>
      m.lessons?.some(l => l.id === lesson.id)
    )
    if (parentModule) {
      setSelectedModule(parentModule)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    )
  }

  // Error state
  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Course not found'}</p>
          <Link to="/instructor/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left: Mobile menu button, Back button and title */}
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link
              to="/instructor/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm hidden sm:inline">Back</span>
            </Link>

            <div className="h-6 w-px bg-gray-200" />

            {/* Editable course title */}
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-64 h-9"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveTitle()
                    if (e.key === 'Escape') cancelEditingTitle()
                  }}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={saveTitle}
                  disabled={isSavingTitle}
                >
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={cancelEditingTitle}
                  disabled={isSavingTitle}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                  {course.title}
                </h1>
                <button
                  onClick={startEditingTitle}
                  className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                  title="Edit course title"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Link to={`/courses/${course.id}`}>
              <Button variant="outline" size="sm">
                Preview Course
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content: Two-panel layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left panel: Module tree */}
        <ModulePanel
          modules={modules}
          selectedModuleId={selectedModule?.id || null}
          selectedLessonId={selectedLesson?.id || null}
          onSelectModule={(module) => {
            handleSelectModule(module)
            setIsSidebarOpen(false)
          }}
          onSelectLesson={(lesson) => {
            handleSelectLesson(lesson)
            setIsSidebarOpen(false)
          }}
          onAddModule={handleAddModule}
          onEditModule={handleEditModule}
          onDeleteModule={handleDeleteModule}
          onAddLesson={handleAddLesson}
          onDeleteLesson={handleDeleteLesson}
          onMoveModule={handleMoveModule}
          onMoveLesson={handleMoveLesson}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Right panel: Lesson editor */}
        <LessonEditor
          lesson={selectedLesson}
          onSave={handleSaveLesson}
          onUploadVideo={handleUploadVideo}
          isSaving={isSavingLesson}
        />
      </div>
    </div>
  )
}
