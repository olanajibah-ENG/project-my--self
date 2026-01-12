import api from '@/lib/api'
import type { CompletedLessonsResponse } from '@/types'

export interface ProgressData {
  completed_lessons: number[]
  total_lessons: number
  progress_percentage: number
}

export const progressService = {
  async getCompletedLessons(): Promise<number[]> {
    const response = await api.get<CompletedLessonsResponse>('/progress/completed-lessons/')
    // Backend returns { results: Lesson[] }, extract IDs
    return response.data.results?.map(lesson => lesson.id) || []
  },

  async markLessonComplete(lessonId: number): Promise<void> {
    await api.post(`/lessons/${lessonId}/complete/`)
  },

  async markLessonIncomplete(lessonId: number): Promise<void> {
    await api.delete(`/lessons/${lessonId}/complete/`)
  },

  calculateProgress(completedLessons: number[], totalLessons: number): number {
    if (totalLessons === 0) return 0
    return Math.round((completedLessons.length / totalLessons) * 100)
  },

  isLessonComplete(lessonId: number, completedLessons: number[]): boolean {
    return completedLessons.includes(lessonId)
  },
}
