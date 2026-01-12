import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Pencil,
  FileText,
  Video,
  ChevronUp,
  Check,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Module, Lesson } from '@/types'

interface ModulePanelProps {
  modules: (Module & { lessons?: Lesson[] })[]
  selectedModuleId: number | null
  selectedLessonId: number | null
  onSelectModule: (module: Module) => void
  onSelectLesson: (lesson: Lesson) => void
  onAddModule: () => void
  onEditModule: (module: Module) => void
  onDeleteModule: (moduleId: number) => void
  onAddLesson: (moduleId: number) => void
  onDeleteLesson: (lessonId: number) => void
  onMoveModule: (moduleId: number, direction: 'up' | 'down') => void
  onMoveLesson: (lessonId: number, moduleId: number, direction: 'up' | 'down') => void
  isOpen?: boolean
  onClose?: () => void
}

export default function ModulePanel({
  modules,
  selectedModuleId,
  selectedLessonId,
  onSelectModule,
  onSelectLesson,
  onAddModule,
  onEditModule,
  onDeleteModule,
  onAddLesson,
  onDeleteLesson,
  onMoveModule,
  onMoveLesson,
  isOpen = true,
  onClose
}: ModulePanelProps) {
  const [expandedModules, setExpandedModules] = useState<number[]>(
    modules.map(m => m.id)
  )
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const startEditingModule = (module: Module, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingModuleId(module.id)
    setEditingTitle(module.title)
  }

  const saveModuleTitle = (module: Module) => {
    if (editingTitle.trim() && editingTitle !== module.title) {
      onEditModule({ ...module, title: editingTitle.trim() })
    }
    setEditingModuleId(null)
    setEditingTitle('')
  }

  const cancelEditing = () => {
    setEditingModuleId(null)
    setEditingTitle('')
  }

  const handleDeleteModule = (moduleId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this module? All lessons within it will also be deleted.')) {
      onDeleteModule(moduleId)
    }
  }

  const handleDeleteLesson = (lessonId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      onDeleteLesson(lessonId)
    }
  }

  // Sort modules by order
  const sortedModules = [...modules].sort((a, b) => a.order - b.order)

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
        "w-[300px] border-r bg-white flex flex-col h-full",
        "lg:relative lg:translate-x-0 lg:z-auto",
        "fixed top-16 left-0 z-50 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Course Curriculum</h2>
            <p className="text-xs text-gray-500 mt-1">
              {modules.length} module{modules.length !== 1 ? 's' : ''} -{' '}
              {modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)} lessons
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-500"
              aria-label="Close panel"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
        {sortedModules.length === 0 ? (
          <div className="text-center py-8 px-4">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-2">No modules yet</p>
            <p className="text-xs text-gray-400">
              Add your first module to start building your course
            </p>
          </div>
        ) : (
          sortedModules.map((module, moduleIndex) => {
            const isExpanded = expandedModules.includes(module.id)
            const isSelectedModule = module.id === selectedModuleId
            const sortedLessons = [...(module.lessons || [])].sort((a, b) => a.order - b.order)

            return (
              <div key={module.id} className="mb-2">
                {/* Module header */}
                <div
                  className={cn(
                    'group flex items-center gap-1 p-2 rounded-lg transition-colors cursor-pointer',
                    isSelectedModule && !selectedLessonId
                      ? 'bg-brand-50 border border-brand-200'
                      : 'hover:bg-gray-50'
                  )}
                  onClick={() => onSelectModule(module)}
                >
                  {/* Expand/Collapse button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleModule(module.id)
                    }}
                    className="p-0.5 hover:bg-gray-200 rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </button>

                  {/* Module title */}
                  <div className="flex-1 min-w-0">
                    {editingModuleId === module.id ? (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="h-7 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveModuleTitle(module)
                            if (e.key === 'Escape') cancelEditing()
                          }}
                        />
                        <button
                          onClick={() => saveModuleTitle(module)}
                          className="p-1 hover:bg-gray-200 rounded text-green-600"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-1 hover:bg-gray-200 rounded text-gray-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs text-gray-400">Module {moduleIndex + 1}</span>
                        <p className="font-medium text-sm truncate text-gray-900">{module.title}</p>
                      </>
                    )}
                  </div>

                  {/* Module actions */}
                  {editingModuleId !== module.id && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {moduleIndex > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onMoveModule(module.id, 'up')
                          }}
                          className="p-1 hover:bg-gray-200 rounded text-gray-500"
                          title="Move up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {moduleIndex < sortedModules.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onMoveModule(module.id, 'down')
                          }}
                          className="p-1 hover:bg-gray-200 rounded text-gray-500"
                          title="Move down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => startEditingModule(module, e)}
                        className="p-1 hover:bg-gray-200 rounded text-gray-500"
                        title="Edit module"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteModule(module.id, e)}
                        className="p-1 hover:bg-red-100 rounded text-red-500"
                        title="Delete module"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Lessons list */}
                {isExpanded && (
                  <div className="ml-5 mt-1 space-y-1">
                    {sortedLessons.map((lesson, lessonIndex) => {
                      const isSelectedLesson = lesson.id === selectedLessonId
                      const hasVideo = !!lesson.video_file

                      return (
                        <div
                          key={lesson.id}
                          className={cn(
                            'group flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer',
                            isSelectedLesson
                              ? 'bg-brand-100 border border-brand-300'
                              : 'hover:bg-gray-50'
                          )}
                          onClick={() => onSelectLesson(lesson)}
                        >
                          {hasVideo ? (
                            <Video className="h-4 w-4 text-brand-500 flex-shrink-0" />
                          ) : (
                            <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          )}
                          <span className="flex-1 text-sm truncate text-gray-700">
                            {lesson.title}
                          </span>

                          {/* Lesson actions */}
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {lessonIndex > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onMoveLesson(lesson.id, module.id, 'up')
                                }}
                                className="p-1 hover:bg-gray-200 rounded text-gray-500"
                                title="Move up"
                              >
                                <ChevronUp className="h-3 w-3" />
                              </button>
                            )}
                            {lessonIndex < sortedLessons.length - 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onMoveLesson(lesson.id, module.id, 'down')
                                }}
                                className="p-1 hover:bg-gray-200 rounded text-gray-500"
                                title="Move down"
                              >
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDeleteLesson(lesson.id, e)}
                              className="p-1 hover:bg-red-100 rounded text-red-500"
                              title="Delete lesson"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )
                    })}

                    {/* Add Lesson button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onAddLesson(module.id)
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-brand-600 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Lesson
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
        </nav>

        {/* Add Module button */}
        <div className="p-3 border-t">
          <Button
            onClick={onAddModule}
            variant="outline"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </div>
      </aside>
    </>
  )
}
