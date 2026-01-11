// src/types/lesson.types.ts
export interface Lesson {
  id: number;
  title: string;
  content_markdown: string;
  video_file: string | null;
  order: number;
  module: number;
}

export interface CreateLessonDTO {
  title: string;
  content_markdown: string;
  order: number;
  module: number;
  video_file?: File | null;
}

export interface UpdateLessonDTO {
  title?: string;
  content_markdown?: string;
  order?: number;
  module?: number;
  video_file?: File | null;
}

export interface LessonFormData {
  title: string;
  content_markdown: string;
  order: number;
  module: number;
  video_file: File | null;
}

export interface LessonsResponse {
  message: string;
  count: number;
  results: Lesson[];
}

export interface MarkdownResponse {
  content_markdown: string;
}

export interface VideoResponse {
  video_file: string | null;
}