import api from '@/lib/api'
import type { Enrollment, Course } from '@/types'

export interface EnrollmentWithCourse extends Enrollment {
  course_details?: Course
}

export const enrollmentService = {
  async getMyEnrollments(): Promise<EnrollmentWithCourse[]> {
    const response = await api.get('/enrollments/')
    return response.data
  },

  async getEnrollment(courseId: number): Promise<Enrollment | null> {
    try {
      const response = await api.get(`/enrollments/`, {
        params: { course: courseId }
      })
      const enrollments = response.data
      return enrollments.length > 0 ? enrollments[0] : null
    } catch {
      return null
    }
  },

  async enroll(courseId: number): Promise<Enrollment> {
    const response = await api.post(`/courses/${courseId}/enroll/`)
    return response.data
  },

  async isEnrolled(courseId: number): Promise<boolean> {
    const enrollment = await this.getEnrollment(courseId)
    return enrollment !== null
  },
}
