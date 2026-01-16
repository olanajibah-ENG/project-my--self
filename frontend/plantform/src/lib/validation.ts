import { z } from 'zod';

// Field size constants matching backend validation
export const VALIDATION_LIMITS = {
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 1000,
  CONTENT_MARKDOWN_MAX_LENGTH: 50000,
  VIDEO_FILE_MAX_SIZE: 10 * 1024 * 1024, // 10MB in bytes
} as const;

// Course validation schema
export const courseSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(VALIDATION_LIMITS.TITLE_MAX_LENGTH, `Title must be ${VALIDATION_LIMITS.TITLE_MAX_LENGTH} characters or less`)
    .trim(),
  description: z
    .string()
    .max(VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH, `Description must be ${VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH} characters or less`)
    .optional()
    .or(z.literal('')),
});

export type CourseFormData = z.infer<typeof courseSchema>;

// Module validation schema
export const moduleSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(VALIDATION_LIMITS.TITLE_MAX_LENGTH, `Title must be ${VALIDATION_LIMITS.TITLE_MAX_LENGTH} characters or less`)
    .trim(),
  description: z
    .string()
    .max(VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH, `Description must be ${VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH} characters or less`)
    .optional()
    .or(z.literal('')),
  order: z.number().nonnegative().optional(),
});

export type ModuleFormData = z.infer<typeof moduleSchema>;

// Lesson validation schema
export const lessonSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(VALIDATION_LIMITS.TITLE_MAX_LENGTH, `Title must be ${VALIDATION_LIMITS.TITLE_MAX_LENGTH} characters or less`)
    .trim(),
  content_markdown: z
    .string()
    .max(VALIDATION_LIMITS.CONTENT_MARKDOWN_MAX_LENGTH, `Content must be ${VALIDATION_LIMITS.CONTENT_MARKDOWN_MAX_LENGTH} characters or less`)
    .optional()
    .or(z.literal('')),
  video_file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= VALIDATION_LIMITS.VIDEO_FILE_MAX_SIZE,
      `Video file must be ${VALIDATION_LIMITS.VIDEO_FILE_MAX_SIZE / (1024 * 1024)}MB or less`
    )
    .optional()
    .nullable(),
  order: z.number().nonnegative().optional(),
});

export type LessonFormData = z.infer<typeof lessonSchema>;

// Helper function to get character count status
export function getCharacterCountStatus(
  current: number,
  max: number
): {
  count: string;
  isNearLimit: boolean;
  isOverLimit: boolean;
} {
  const isNearLimit = current >= max * 0.9;
  const isOverLimit = current > max;

  return {
    count: `${current}/${max}`,
    isNearLimit,
    isOverLimit,
  };
}

// Helper function to validate file size
export function validateFileSize(file: File | null | undefined): {
  isValid: boolean;
  errorMessage?: string;
} {
  if (!file) {
    return { isValid: true };
  }

  if (file.size > VALIDATION_LIMITS.VIDEO_FILE_MAX_SIZE) {
    const sizeMB = (VALIDATION_LIMITS.VIDEO_FILE_MAX_SIZE / (1024 * 1024)).toFixed(0);
    return {
      isValid: false,
      errorMessage: `Video file must be ${sizeMB}MB or less`,
    };
  }

  return { isValid: true };
}
