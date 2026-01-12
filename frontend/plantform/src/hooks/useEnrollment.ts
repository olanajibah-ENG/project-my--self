import { useState, useEffect, useCallback } from 'react'
import { enrollmentService, type EnrollmentWithCourse } from '@/services/enrollment.service'

export function useMyEnrollments() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEnrollments = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await enrollmentService.getMyEnrollments()
      setEnrollments(data)
    } catch (err) {
      setError('Failed to load enrollments')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  return { enrollments, isLoading, error, refetch: fetchEnrollments }
}

export function useEnrollment(courseId: number | null) {
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolling, setIsEnrolling] = useState(false)

  useEffect(() => {
    if (!courseId) {
      setIsLoading(false)
      return
    }

    const checkEnrollment = async () => {
      try {
        setIsLoading(true)
        const enrolled = await enrollmentService.isEnrolled(courseId)
        setIsEnrolled(enrolled)
      } catch {
        setIsEnrolled(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkEnrollment()
  }, [courseId])

  const enroll = useCallback(async () => {
    if (!courseId) return
    try {
      setIsEnrolling(true)
      await enrollmentService.enroll(courseId)
      setIsEnrolled(true)
    } finally {
      setIsEnrolling(false)
    }
  }, [courseId])

  return { isEnrolled, isLoading, isEnrolling, enroll }
}
