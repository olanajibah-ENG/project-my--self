import { useState, useEffect, useCallback } from 'react'
import { progressService } from '@/services/progress.service'

export function useProgress() {
  const [completedLessons, setCompletedLessons] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchProgress = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await progressService.getCompletedLessons()
      setCompletedLessons(data)
    } catch {
      setCompletedLessons([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  const markComplete = useCallback(async (lessonId: number) => {
    // Optimistic update
    setCompletedLessons(prev => [...prev, lessonId])

    try {
      await progressService.markLessonComplete(lessonId)
      // Success - keep optimistic update
    } catch (error) {
      // Revert optimistic update
      setCompletedLessons(prev => prev.filter(id => id !== lessonId))
      // Re-throw for caller to handle error message
      throw error
    }
  }, [])

  const markIncomplete = useCallback(async (lessonId: number) => {
    // Optimistic update
    setCompletedLessons(prev => prev.filter(id => id !== lessonId))

    try {
      await progressService.markLessonIncomplete(lessonId)
      // Success - keep optimistic update
    } catch (error) {
      // Revert optimistic update
      setCompletedLessons(prev => [...prev, lessonId])
      // Re-throw for caller to handle error message
      throw error
    }
  }, [])

  const isComplete = useCallback((lessonId: number) => {
    return completedLessons.includes(lessonId)
  }, [completedLessons])

  const getProgress = useCallback((totalLessons: number) => {
    return progressService.calculateProgress(completedLessons, totalLessons)
  }, [completedLessons])

  const getProgressForCourse = useCallback((courseLessonIds: number[], totalLessons: number) => {
    if (totalLessons === 0) return 0
    const idsSet = new Set(courseLessonIds)
    const completedInCourse = completedLessons.filter(id => idsSet.has(id)).length
    return Math.round((completedInCourse / totalLessons) * 100)
  }, [completedLessons])

  return {
    completedLessons,
    isLoading,
    markComplete,
    markIncomplete,
    isComplete,
    getProgress,
    getProgressForCourse,
    refetch: fetchProgress
  }
}
