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
    await progressService.markLessonComplete(lessonId)
    setCompletedLessons(prev => [...prev, lessonId])
  }, [])

  const markIncomplete = useCallback(async (lessonId: number) => {
    await progressService.markLessonIncomplete(lessonId)
    setCompletedLessons(prev => prev.filter(id => id !== lessonId))
  }, [])

  const isComplete = useCallback((lessonId: number) => {
    return completedLessons.includes(lessonId)
  }, [completedLessons])

  const getProgress = useCallback((totalLessons: number) => {
    return progressService.calculateProgress(completedLessons, totalLessons)
  }, [completedLessons])

  return {
    completedLessons,
    isLoading,
    markComplete,
    markIncomplete,
    isComplete,
    getProgress,
    refetch: fetchProgress
  }
}
