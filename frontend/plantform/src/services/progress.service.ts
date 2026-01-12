import api from '@/lib/api'

export interface ProgressData {
  completed_lessons: number[]
  total_lessons: number
  progress_percentage: number
}

export const progressService = {
  async getCompletedLessons(): Promise<number[]> {
    const response = await api.get('/progress/completed-lessons/')
    return response.data.completed_lessons || []
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
