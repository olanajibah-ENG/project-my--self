import api from '@/lib/api'
import type { Course, Module, Lesson } from '@/types'

export interface CourseWithDetails extends Course {
  modules?: (Module & { lessons?: Lesson[] })[]
}

export const courseService = {
  async getCourses(): Promise<Course[]> {
    const response = await api.get('/courses/')
    return response.data
  },

  async getCourse(id: number): Promise<CourseWithDetails> {
    const response = await api.get(`/courses/${id}/`)
    return response.data
  },

  async getMyCourses(): Promise<Course[]> {
    const response = await api.get('/courses/', {
      params: { my_courses: true }
    })
    return response.data
  },

  async createCourse(data: { title: string; description: string }): Promise<Course> {
    const response = await api.post('/courses/', data)
    return response.data
  },

  async updateCourse(id: number, data: Partial<Course>): Promise<Course> {
    const response = await api.put(`/courses/${id}/`, data)
    return response.data
  },

  async deleteCourse(id: number): Promise<void> {
    await api.delete(`/courses/${id}/`)
  },

  async enrollInCourse(courseId: number): Promise<void> {
    await api.post(`/courses/${courseId}/enroll/`)
  },
}
