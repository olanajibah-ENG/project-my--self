import { useState, useEffect, useCallback } from 'react'
import { lessonService } from '@/services/lesson.service'
import type { Lesson } from '@/types'

export function useLessons(moduleId: number | null) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLessons = useCallback(async () => {
    if (!moduleId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await lessonService.getLessons(moduleId)
      setLessons(data)
    } catch (err) {
      setError('Failed to load lessons')
    } finally {
      setIsLoading(false)
    }
  }, [moduleId])

  useEffect(() => {
    fetchLessons()
  }, [fetchLessons])

  return { lessons, isLoading, error, refetch: fetchLessons }
}

export function useLesson(id: number | null) {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      return
    }

    const fetchLesson = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await lessonService.getLesson(id)
        setLesson(data)
      } catch (err) {
        setError('Failed to load lesson')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLesson()
  }, [id])

  return { lesson, isLoading, error }
}
