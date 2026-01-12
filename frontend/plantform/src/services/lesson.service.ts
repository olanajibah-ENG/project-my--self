import api from '@/lib/api'
import type { Lesson } from '@/types'

export interface CreateLessonData {
  title: string
  content_markdown: string
  order: number
}

export const lessonService = {
  async getLessons(moduleId: number): Promise<Lesson[]> {
    const response = await api.get(`/modules/${moduleId}/lessons/`)
    return response.data
  },

  async getLesson(id: number): Promise<Lesson> {
    const response = await api.get(`/lessons/${id}/`)
    return response.data
  },

  async createLesson(moduleId: number, data: CreateLessonData): Promise<Lesson> {
    const response = await api.post(`/modules/${moduleId}/lessons/`, data)
    return response.data
  },

  async updateLesson(id: number, data: Partial<Lesson>): Promise<Lesson> {
    const response = await api.put(`/lessons/${id}/`, data)
    return response.data
  },

  async deleteLesson(id: number): Promise<void> {
    await api.delete(`/lessons/${id}/`)
  },

  async reorderLessons(moduleId: number, lessonIds: number[]): Promise<void> {
    await api.post(`/modules/${moduleId}/lessons/reorder/`, { lesson_ids: lessonIds })
  },

  async uploadVideo(lessonId: number, file: File): Promise<Lesson> {
    const formData = new FormData()
    formData.append('video_file', file)
    const response = await api.post(`/lessons/${lessonId}/upload-video/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}
