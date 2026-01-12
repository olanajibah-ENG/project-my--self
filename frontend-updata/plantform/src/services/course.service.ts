// src/services/course.service.ts

import { apiClient } from '../config/api.config';
import type { Course, CreateCourseDTO, UpdateCourseDTO } from '../types/course.types';

export class CourseService {
  // الحصول على جميع الكورسات
  static async getAllCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>('courses/');
    return response.data;
  }

  // الحصول على كورس واحد
  static async getCourseById(id: number): Promise<Course> {
    const response = await apiClient.get<Course>(`courses/${id}/`);
    return response.data;
  }

  // إنشاء كورس جديد
  static async createCourse(data: CreateCourseDTO): Promise<Course> {
    const response = await apiClient.post<Course>('courses/', data);
    return response.data;
  }

  // تعديل كورس
  static async updateCourse(id: number, data: UpdateCourseDTO): Promise<Course> {
    const response = await apiClient.put<Course>(`courses/${id}/`, data);
    return response.data;
  }

  // حذف كورس
  static async deleteCourse(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`courses/${id}/`);
    return response.data;
  }
}
