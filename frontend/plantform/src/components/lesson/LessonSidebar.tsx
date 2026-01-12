import { ChevronDown, ChevronRight, CheckCircle, Circle, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Module, Lesson } from '@/types'

interface LessonSidebarProps {
  modules: (Module & { lessons?: Lesson[] })[]
  currentLessonId: number | null
  completedLessons: number[]
  onLessonSelect: (lesson: Lesson) => void
  isOpen?: boolean
  onClose?: () => void
}

export default function LessonSidebar({
  modules,
  currentLessonId,
  completedLessons,
  onLessonSelect,
  isOpen = true,
  onClose
}: LessonSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<number[]>(
    modules.map(m => m.id)
  )

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const isComplete = (lessonId: number) => completedLessons.includes(lessonId)
  const isCurrent = (lessonId: number) => lessonId === currentLessonId

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={cn(
        "w-72 border-r bg-white overflow-y-auto h-[calc(100vh-4rem)]",
        "lg:relative lg:translate-x-0 lg:z-auto",
        "fixed top-16 left-0 z-50 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Course Content</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-500"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <nav className="p-2">
        {modules.map((module, idx) => (
          <div key={module.id} className="mb-2">
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-50 text-left"
            >
              {expandedModules.includes(module.id) ? (
                <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-xs text-gray-500">Module {idx + 1}</span>
                <p className="font-medium text-sm truncate">{module.title}</p>
              </div>
            </button>

            {expandedModules.includes(module.id) && module.lessons && (
              <div className="ml-6 space-y-1">
                {module.lessons.map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => onLessonSelect(lesson)}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded text-left text-sm transition-colors",
                      isCurrent(lesson.id)
                        ? "bg-brand-50 text-brand-700"
                        : "hover:bg-gray-50 text-gray-600"
                    )}
                  >
                    {isComplete(lesson.id) ? (
                      <CheckCircle className="h-4 w-4 text-brand-600 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                    )}
                    <span className="truncate">{lesson.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        </nav>
      </aside>
    </>
  )
}
