// src/types/student.types.ts
import type{ Course } from './course.types';
import type { Lesson } from './lesson.types';

export interface Enrollment {
  id: number;
  student: number;
  course: number;
  enrolled_at: string;
}

export interface EnrollmentResponse {
  message: string;
  enrollment: Enrollment;
  course: Course;
}

export interface CompletedLessonsResponse {
  message: string;
  count: number;
  results: Lesson[];
}

export interface CompleteLesson {
  message: string;
  lesson_id: number;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
}