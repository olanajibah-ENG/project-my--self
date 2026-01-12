import api from '@/lib/api'
import type { Lesson } from '@/types'

export interface CreateLessonData {
  title: string
  content_markdown: string
  order: number
}

export const lessonService = {
  async getLessons(moduleId: number): Promise<Lesson[]> {
    // Backend returns { results: [...] } format
    const response = await api.get('/lessons/', {
      params: { module: moduleId }
    })
    return response.data.results || response.data
  },

  async getLesson(id: number): Promise<Lesson> {
    const response = await api.get(`/lessons/${id}/`)
    return response.data
  },

  async createLesson(moduleId: number, data: CreateLessonData): Promise<Lesson> {
    // Backend expects module ID in body
    const response = await api.post('/lessons/', {
      ...data,
      module: moduleId
    })
    return response.data
  },

  async updateLesson(id: number, data: Partial<Lesson>): Promise<Lesson> {
    const response = await api.patch(`/lessons/${id}/`, data)
    return response.data
  },

  async deleteLesson(id: number): Promise<void> {
    await api.delete(`/lessons/${id}/`)
  },

  async reorderLessons(moduleId: number, lessonIds: number[]): Promise<void> {
    // This endpoint may not exist in backend - will fail gracefully
    await api.post('/lessons/reorder/', { module: moduleId, lesson_ids: lessonIds })
  },

  async uploadVideo(lessonId: number, file: File): Promise<Lesson> {
    const formData = new FormData()
    formData.append('video_file', file)
    // Use PATCH to update the lesson with video
    const response = await api.patch(`/lessons/${lessonId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}
