// src/types/course.types.ts

import type { Module } from './module.types';

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  created_at: string;
  modules?: Module[];
}

export interface CreateCourseDTO {
  title: string;
  description: string;
}

export interface UpdateCourseDTO {
  title?: string;
  description?: string;
}

export interface CourseFormData {
  title: string;
  description: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}
