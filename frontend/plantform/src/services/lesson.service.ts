// src/services/lesson.service.ts
import { apiClient } from '../config/api.config';
import type { 
  Lesson, 
  CreateLessonDTO, 
  UpdateLessonDTO, 
  LessonsResponse, 
  MarkdownResponse, 
  VideoResponse 
} from '../types/lesson.types';

const API_ENDPOINTS = {
  LESSONS: '/lessons/',
  LESSON_BY_ID: (id: number) => `/lessons/${id}/`,
  LESSON_MARKDOWN: (id: number) => `/lessons/${id}/markdown/`,
  LESSON_VIDEO: (id: number) => `/lessons/${id}/video/`,
};

export class LessonService {
  // الحصول على جميع الدروس
  static async getAllLessons(): Promise<LessonsResponse> {
    const response = await apiClient.get<LessonsResponse>(API_ENDPOINTS.LESSONS);
    return response.data;
  }

  // الحصول على درس واحد
  static async getLessonById(id: number): Promise<Lesson> {
    const response = await apiClient.get<Lesson>(API_ENDPOINTS.LESSON_BY_ID(id));
    return response.data;
  }

  // إنشاء درس جديد (مع دعم رفع الفيديو)
  static async createLesson(data: CreateLessonDTO): Promise<Lesson> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content_markdown', data.content_markdown);
    formData.append('order', data.order.toString());
    formData.append('module', data.module.toString());

    if (data.video_file) {
      formData.append('video_file', data.video_file);
    }

    const response = await apiClient.post<Lesson>(API_ENDPOINTS.LESSONS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // تعديل درس
  static async updateLesson(id: number, data: UpdateLessonDTO): Promise<Lesson> {
    const formData = new FormData();
    
    if (data.title) formData.append('title', data.title);
    if (data.content_markdown) formData.append('content_markdown', data.content_markdown);
    if (data.order) formData.append('order', data.order.toString());
    if (data.module) formData.append('module', data.module.toString());
    if (data.video_file) formData.append('video_file', data.video_file);

    const response = await apiClient.put<Lesson>(
      API_ENDPOINTS.LESSON_BY_ID(id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  // حذف درس
  static async deleteLesson(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.LESSON_BY_ID(id)
    );
    return response.data;
  }

  // الحصول على Markdown
  static async getLessonMarkdown(id: number): Promise<MarkdownResponse> {
    const response = await apiClient.get<MarkdownResponse>(
      API_ENDPOINTS.LESSON_MARKDOWN(id)
    );
    return response.data;
  }

  // الحصول على الفيديو
  static async getLessonVideo(id: number): Promise<VideoResponse> {
    const response = await apiClient.get<VideoResponse>(
      API_ENDPOINTS.LESSON_VIDEO(id)
    );
    return response.data;
  }
}