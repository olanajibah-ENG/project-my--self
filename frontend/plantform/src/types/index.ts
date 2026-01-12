export type UserRole = 'student' | 'instructor'

export interface User {
  id: number
  username: string
  email: string
  role: UserRole
}

export interface Course {
  id: number
  title: string
  description: string
  instructor: number
  instructor_name?: string
  created_at: string
  modules_count?: number
  lessons_count?: number
  enrolled_count?: number
}

export interface Module {
  id: number
  title: string
  description: string
  order: number
  course: number
  lessons?: Lesson[]
}

export interface Lesson {
  id: number
  title: string
  content_markdown: string
  video_file: string | null
  order: number
  module: number
}

export interface Enrollment {
  id: number
  student: number
  course: number
  enrolled_at: string
  completed_lessons: number[]
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  role: UserRole
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}
