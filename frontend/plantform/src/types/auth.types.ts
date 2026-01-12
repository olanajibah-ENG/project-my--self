// src/types/auth.types.ts
export type UserRole = 'student' | 'instructor';

export interface User {
    id: number;
    username: string;
    email: string;
    role: UserRole;
}

export interface AuthResponse {
    access: string;
    refresh: string;
    username: string;
    role: UserRole;
    user_id: number;
}
