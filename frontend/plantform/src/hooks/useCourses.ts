import { useState, useEffect, useCallback } from 'react'
import { courseService, type CourseWithDetails } from '@/services/course.service'
import type { Course } from '@/types'

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await courseService.getCourses()
      setCourses(data)
    } catch (err) {
      setError('Failed to load courses')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  return { courses, isLoading, error, refetch: fetchCourses }
}

export function useCourse(id: number | null) {
  const [course, setCourse] = useState<CourseWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      return
    }

    const fetchCourse = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await courseService.getCourse(id)
        setCourse(data)
      } catch (err) {
        setError('Failed to load course')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [id])

  return { course, isLoading, error }
}
