// src/services/student.service.ts
import { apiClient } from '../config/api.config';
import type { 
  EnrollmentResponse, 
  CompletedLessonsResponse, 
  CompleteLesson, 
  RefreshTokenResponse 
} from '../types/student.types';

const API_ENDPOINTS = {
  ENROLL_COURSE: (courseId: number) => `/courses/${courseId}/enroll/`,
  COMPLETE_LESSON: (lessonId: number) => `/lessons/${lessonId}/complete/`,
  COMPLETED_LESSONS: '/progress/completed-lessons/',
  REFRESH_TOKEN: '/auth/refresh/',
};

export class StudentService {
  // التسجيل في كورس
  static async enrollInCourse(courseId: number): Promise<EnrollmentResponse> {
    const response = await apiClient.post<EnrollmentResponse>(
      API_ENDPOINTS.ENROLL_COURSE(courseId)
    );
    return response.data;
  }

  // تحديد درس كمكتمل
  static async markLessonComplete(lessonId: number): Promise<CompleteLesson> {
    const response = await apiClient.post<CompleteLesson>(
      API_ENDPOINTS.COMPLETE_LESSON(lessonId)
    );
    return response.data;
  }

  // الحصول على جميع الدروس المكتملة
  static async getCompletedLessons(): Promise<CompletedLessonsResponse> {
    const response = await apiClient.get<CompletedLessonsResponse>(
      API_ENDPOINTS.COMPLETED_LESSONS
    );
    return response.data;
  }

  // تحديث الـ Access Token
  static async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>(
      API_ENDPOINTS.REFRESH_TOKEN,
      { refresh: refreshToken }
    );
    return response.data;
  }
}