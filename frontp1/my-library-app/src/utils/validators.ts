import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional()
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Book validation schemas
export const bookSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  author: z
    .string()
    .min(1, 'Author is required')
    .max(100, 'Author name must be less than 100 characters'),
  isbn: z
    .string()
    .min(1, 'ISBN is required')
    .regex(/^(?:\d{10}|\d{13})$/, 'ISBN must be 10 or 13 digits'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  category: z
    .string()
    .max(50, 'Category must be less than 50 characters')
    .optional(),
  publicationYear: z
    .number()
    .int()
    .min(1000, 'Publication year must be valid')
    .max(new Date().getFullYear() + 1, 'Publication year cannot be in the future')
    .optional(),
  coverImageUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  totalQuantity: z
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(1000, 'Quantity cannot exceed 1000')
});

// Transaction validation schemas
export const borrowSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  expectedReturnDate: z
    .string()
    .min(1, 'Return date is required')
    .refine((date) => {
      const returnDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return returnDate >= today;
    }, 'Return date cannot be in the past'),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
});

export const returnSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  returnDate: z
    .string()
    .min(1, 'Return date is required'),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
});

// Search validation
export const searchSchema = z.object({
  query: z
    .string()
    .max(100, 'Search query must be less than 100 characters')
    .optional()
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type BookFormData = z.infer<typeof bookSchema>;
export type BorrowFormData = z.infer<typeof borrowSchema>;
export type ReturnFormData = z.infer<typeof returnSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
