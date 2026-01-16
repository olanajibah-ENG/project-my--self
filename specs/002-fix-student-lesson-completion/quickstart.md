# Quickstart Guide: Fix Student Lesson Completion Tracking

**Feature**: 002-fix-student-lesson-completion
**Branch**: `002-fix-student-lesson-completion`
**Date**: 2026-01-13

## Overview

This guide provides a quick reference for implementing the bug fixes to the student lesson completion tracking system. All changes are **frontend-only** - no backend modifications required.

## Prerequisites

- Git branch `002-fix-student-lesson-completion` checked out
- Node.js and npm installed
- Frontend dev server can be started (`cd frontend/plantform && npm run dev`)
- Backend server running (`cd backend && python manage.py runserver 8001`)
- You have read: [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md)

## Quick Reference

### Files to Modify

| File | Location | Purpose | Priority |
|------|----------|---------|----------|
| `progress.service.ts` | `frontend/plantform/src/services/` | Fix API response parsing | **P1 Critical** |
| `useProgress.ts` | `frontend/plantform/src/hooks/` | Add error handling + course filtering | **P1 Critical** |
| `LearningView.tsx` | `frontend/plantform/src/pages/student/` | Handle error display | **P2 High** |
| `StudentDashboard.tsx` | `frontend/plantform/src/pages/student/` | Fix progress calculation | **P2 High** |
| `CourseDetail.tsx` | `frontend/plantform/src/pages/student/` | Fix progress calculation | **P2 High** |

### Bug Fixes Summary

| Bug | Root Cause | Fix | File |
|-----|------------|-----|------|
| Completion status lost after refresh | Frontend expects `data.completed_lessons`, backend returns `data.results` | Parse `data.results.map(l => l.id)` | `progress.service.ts:12` |
| Incorrect progress % (cross-course) | Uses global completions / course total | Filter completions by course before calculating | `useProgress.ts` + views |
| No error feedback on network failure | No try-catch in mark complete | Add try-catch with UI reversion + toast | `useProgress.ts` |

---

## Implementation Steps

### Step 1: Fix API Response Parsing (P1 - Critical)

**File**: `frontend/plantform/src/services/progress.service.ts`

**Current Code** (lines 10-13):
```typescript
async getCompletedLessons(): Promise<number[]> {
  const response = await api.get('/progress/completed-lessons/')
  return response.data.completed_lessons || []  // ❌ Field doesn't exist!
}
```

**Fixed Code**:
```typescript
async getCompletedLessons(): Promise<number[]> {
  const response = await api.get('/progress/completed-lessons/')
  // Backend returns { results: Lesson[] }, extract IDs
  return response.data.results?.map((lesson: any) => lesson.id) || []
}
```

**Alternative (with type safety)**:
```typescript
interface CompletedLessonsResponse {
  message: string
  count: number
  results: Array<{ id: number; title: string; content_markdown: string; video_file: string | null; order: number; module: number }>
}

async getCompletedLessons(): Promise<number[]> {
  const response = await api.get<CompletedLessonsResponse>('/progress/completed-lessons/')
  return response.data.results?.map(lesson => lesson.id) || []
}
```

**Test**:
1. Mark a lesson complete
2. Refresh the page
3. Verify lesson still shows as completed ✅

---

### Step 2: Add Error Handling to Hook (P1 - Critical)

**File**: `frontend/plantform/src/hooks/useProgress.ts`

**Current Code** (lines 24-27):
```typescript
const markComplete = useCallback(async (lessonId: number) => {
  await progressService.markLessonComplete(lessonId)
  setCompletedLessons(prev => [...prev, lessonId])
}, [])
```

**Fixed Code**:
```typescript
const markComplete = useCallback(async (lessonId: number) => {
  // Optimistic update
  setCompletedLessons(prev => [...prev, lessonId])

  try {
    await progressService.markLessonComplete(lessonId)
    // Success - keep optimistic update
  } catch (error) {
    // Revert optimistic update
    setCompletedLessons(prev => prev.filter(id => id !== lessonId))
    // Re-throw for caller to handle error message
    throw error
  }
}, [])
```

**Do the same for `markIncomplete`**:
```typescript
const markIncomplete = useCallback(async (lessonId: number) => {
  // Optimistic update
  setCompletedLessons(prev => prev.filter(id => id !== lessonId))

  try {
    await progressService.markLessonIncomplete(lessonId)
    // Success - keep optimistic update
  } catch (error) {
    // Revert optimistic update
    setCompletedLessons(prev => [...prev, lessonId])
    // Re-throw for caller to handle error message
    throw error
  }
}, [])
```

**Test**:
1. Disconnect network (browser DevTools → Network → Offline)
2. Mark lesson complete
3. Verify error message appears
4. Verify lesson shows as incomplete after error ✅

---

### Step 3: Handle Errors in LearningView (P2 - High)

**File**: `frontend/plantform/src/pages/student/LearningView.tsx`

**Current Code** (lines 54-58):
```typescript
const handleMarkComplete = async () => {
  if (currentLesson) {
    await markComplete(currentLesson.id)
  }
}
```

**Fixed Code**:
```typescript
const handleMarkComplete = async () => {
  if (currentLesson) {
    try {
      await markComplete(currentLesson.id)
      // Optional: show success toast
      // addToast('Lesson marked as complete', 'success')
    } catch (error) {
      // Show error toast (assuming ToastContext is available)
      addToast('Failed to mark lesson complete. Please try again.', 'error')
    }
  }
}
```

**Do the same for unmark** (if exists).

**Test**:
1. Mark lesson complete (should work)
2. Verify success (no error toast)
3. Disconnect network, mark another lesson
4. Verify error toast appears ✅

---

### Step 4: Fix Progress Calculation (P2 - High)

**File**: `frontend/plantform/src/hooks/useProgress.ts`

**Current Code**:
```typescript
const getProgress = (totalLessons: number) => {
  if (totalLessons === 0) return 0
  return Math.round((completedLessons.length / totalLessons) * 100)
}
```

**Problem**: `completedLessons.length` includes lessons from ALL courses, not just the current course.

**Fixed Code** (add new function):
```typescript
const getProgressForCourse = (courseId: number, courseLessons: Lesson[], totalLessons: number) => {
  if (totalLessons === 0) return 0

  // Get IDs of lessons in this specific course
  const courseLessonIds = new Set(courseLessons.map(l => l.id))

  // Count how many completed lessons belong to this course
  const courseCompletedCount = completedLessons.filter(id => courseLessonIds.has(id)).length

  return Math.round((courseCompletedCount / totalLessons) * 100)
}
```

**Alternative (simpler, if you only have lesson IDs)**:
```typescript
const getProgressForCourse = (courseLessonIds: number[], totalLessons: number) => {
  if (totalLessons === 0) return 0

  const idsSet = new Set(courseLessonIds)
  const completedInCourse = completedLessons.filter(id => idsSet.has(id)).length

  return Math.round((completedInCourse / totalLessons) * 100)
}
```

**Export the new function** from useProgress hook:
```typescript
return {
  completedLessons,
  loading,
  error,
  fetchProgress,
  markComplete,
  markIncomplete,
  isComplete,
  getProgress,           // Keep for backward compat (deprecate later)
  getProgressForCourse,  // NEW
}
```

---

### Step 5: Update Progress Display in Dashboard (P2 - High)

**File**: `frontend/plantform/src/pages/student/StudentDashboard.tsx`

**Current Code** (line 73):
```typescript
{getProgress(lastEnrollment.course_details.lessons_count || 0)}% complete
```

**Problem**: This uses the global `getProgress` which doesn't filter by course.

**Fixed Code**:
```typescript
{getProgressForCourse(
  lastEnrollment.course,  // course ID
  lastEnrollment.course_details?.modules?.flatMap(m => m.lessons) || [],  // all lessons in course
  lastEnrollment.course_details?.lessons_count || 0
)}% complete
```

**Alternative (if you don't have full lesson objects)**:
```typescript
// Extract lesson IDs from course details
const courseLessonIds = lastEnrollment.course_details?.modules
  ?.flatMap(m => m.lessons?.map(l => l.id) || []) || []

{getProgressForCourse(courseLessonIds, lastEnrollment.course_details?.lessons_count || 0)}% complete
```

**Test**:
1. Enroll in Course A, complete 2/10 lessons → should show 20%
2. Enroll in Course B, complete 1/5 lessons → should show 20%
3. View dashboard → Course A shows 20%, Course B shows 20% (independent) ✅

---

### Step 6: Update Progress Display in CourseDetail (P2 - High)

**File**: `frontend/plantform/src/pages/student/CourseDetail.tsx`

**Current Code** (line 139):
```typescript
{getProgress(course?.lessons_count || 0)}% complete
```

**Fixed Code**:
```typescript
{getProgressForCourse(
  course?.id || 0,
  course?.modules?.flatMap(m => m.lessons) || [],
  course?.lessons_count || 0
)}% complete
```

**Test**:
1. View Course A detail page
2. Verify progress % matches only lessons completed in Course A ✅

---

## Testing Checklist

**Implementation Status**: ✅ COMPLETED (2026-01-13)

### Manual Testing Steps

**P1 - Core Functionality**:
- [ ] Mark lesson complete → Refresh page → Lesson still shows complete
- [ ] Mark lesson incomplete → Refresh page → Lesson shows incomplete
- [ ] Disconnect network → Mark complete → Error message displays + lesson stays incomplete
- [ ] Mark complete in Tab A → Refresh Tab B → Tab B shows completed (sync via backend)

**P2 - Progress Accuracy**:
- [ ] Enroll in Course A (10 lessons), complete 3 → Dashboard shows "30% complete"
- [ ] Enroll in Course B (5 lessons), complete 2 → Dashboard shows "40% complete" for B, still "30%" for A
- [ ] Complete 1 more lesson in Course A → Dashboard updates to "40%" for A
- [ ] View Course A detail page → Progress bar shows 40%
- [ ] View Course B detail page → Progress bar shows 40%

**P3 - Edge Cases**:
- [ ] Complete all lessons in a course → Progress shows "100%"
- [ ] New enrollment (0 lessons complete) → Progress shows "0%"
- [ ] Toggle completion rapidly → UI stays in sync, no duplicates in state

---

## Rollback Plan

If something goes wrong:

```bash
# Rollback all frontend changes
git checkout HEAD -- frontend/plantform/src/services/progress.service.ts
git checkout HEAD -- frontend/plantform/src/hooks/useProgress.ts
git checkout HEAD -- frontend/plantform/src/pages/student/LearningView.tsx
git checkout HEAD -- frontend/plantform/src/pages/student/StudentDashboard.tsx
git checkout HEAD -- frontend/plantform/src/pages/student/CourseDetail.tsx

# Rebuild
cd frontend/plantform
npm run dev
```

---

## Performance Notes

- All changes are O(n) or better (no nested loops)
- Filtering completed lessons by course is fast (100 lessons takes <1ms)
- No additional API calls introduced
- Optimistic updates provide instant UI feedback

---

## Common Issues & Fixes

### Issue: "Cannot read property 'map' of undefined"

**Cause**: `response.data.results` is undefined (backend error)

**Fix**: Add null check:
```typescript
return response.data.results?.map(lesson => lesson.id) || []
```

---

### Issue: Progress still showing wrong percentage

**Cause**: Not passing correct lesson array to `getProgressForCourse`

**Fix**: Ensure you're passing ALL lessons in the course:
```typescript
course.modules.flatMap(m => m.lessons)  // ✅ All lessons
// NOT:
course.modules[0].lessons  // ❌ Only first module's lessons
```

---

### Issue: Error toast not appearing

**Cause**: ToastContext not available in component

**Fix**: Import and use ToastContext:
```typescript
import { useToast } from '@/context/ToastContext'

const { addToast } = useToast()
```

---

## Next Steps

After implementing these fixes:

1. **Test thoroughly** using the checklist above
2. **Commit changes**:
   ```bash
   git add frontend/plantform/src/services/progress.service.ts
   git add frontend/plantform/src/hooks/useProgress.ts
   git add frontend/plantform/src/pages/student/*.tsx
   git commit -m "fix: correct lesson completion tracking and progress calculation

   - Fix API response parsing in progress.service.ts
   - Add error handling with UI reversion in useProgress
   - Implement course-specific progress calculation
   - Display error messages for network failures

   Fixes: lesson completion status not persisting after refresh
   Fixes: incorrect progress percentages across multiple courses"
   ```
3. **Run `/speckit.tasks`** to generate implementation tasks
4. **Begin implementation** following the task breakdown

---

## Reference Links

- [Feature Specification](./spec.md)
- [Research Document](./research.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/progress-api.yaml)

---

## Support

If you encounter issues not covered here:
1. Check the [research.md](./research.md) for detailed rationale
2. Review the [data-model.md](./data-model.md) for data flow diagrams
3. Consult the [API contract](./contracts/progress-api.yaml) for exact response formats
