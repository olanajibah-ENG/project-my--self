import { useState } from 'react'
import { ChevronDown, ChevronRight, Video, FileText, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Module, Lesson } from '@/types'

interface CurriculumOutlineProps {
  modules: (Module & { lessons?: Lesson[] })[]
  completedLessons?: number[]
  onLessonClick?: (lesson: Lesson) => void
}

export default function CurriculumOutline({
  modules,
  completedLessons = [],
  onLessonClick
}: CurriculumOutlineProps) {
  const [expandedModules, setExpandedModules] = useState<number[]>(
    modules.length > 0 ? [modules[0].id] : []
  )

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const isExpanded = (moduleId: number) => expandedModules.includes(moduleId)
  const isComplete = (lessonId: number) => completedLessons.includes(lessonId)

  return (
    <div className="space-y-2">
      {modules.map((module, index) => (
        <div key={module.id} className="border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleModule(module.id)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              {isExpanded(module.id) ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
              <div className="text-left">
                <span className="text-sm text-gray-500">Module {index + 1}</span>
                <h3 className="font-medium">{module.title}</h3>
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {module.lessons?.length || 0} lessons
            </span>
          </button>

          {isExpanded(module.id) && module.lessons && (
            <div className="border-t divide-y">
              {module.lessons.map(lesson => (
                <div
                  key={lesson.id}
                  onClick={() => onLessonClick?.(lesson)}
                  className={cn(
                    "flex items-center gap-3 p-4 pl-12",
                    onLessonClick && "cursor-pointer hover:bg-gray-50"
                  )}
                >
                  {isComplete(lesson.id) ? (
                    <CheckCircle className="h-5 w-5 text-brand-600" />
                  ) : lesson.video_file ? (
                    <Video className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FileText className="h-5 w-5 text-gray-400" />
                  )}
                  <span className={cn(
                    isComplete(lesson.id) && "text-gray-500"
                  )}>
                    {lesson.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
