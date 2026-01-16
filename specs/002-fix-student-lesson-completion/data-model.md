# Data Model: Fix Student Lesson Completion Tracking

**Feature**: 002-fix-student-lesson-completion
**Date**: 2026-01-13
**Phase**: 1 - Design & Contracts

## Purpose

This document describes the data model and state management for the lesson completion tracking bug fix. Since this is a bug fix with no backend changes, the focus is on frontend state structure and data flow corrections.

## Backend Data Model (Existing - No Changes)

### Database Schema

The backend database schema remains unchanged. This section documents the existing structure for reference.

#### Enrollment Model

```python
# backend/plantform/models/enrollment.py
class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_lessons = models.ManyToManyField(Lesson, blank=True)

    class Meta:
        unique_together = ('student', 'course')
```

**Key Points**:
- `completed_lessons` is a ManyToMany relationship to Lesson model
- One enrollment per student-course pair
- Enrollment deletion cascades from User deletion
- Orphaned lesson completions are preserved (lesson deletion doesn't cascade)

#### Lesson Model

```python
# backend/plantform/models/lesson.py
class Lesson(models.Model):
    title = models.CharField(max_length=255)
    content_markdown = models.TextField()
    video_file = models.FileField(upload_to="lesson_videos/", null=True, blank=True)
    order = models.PositiveIntegerField()
    module = models.ForeignKey(Module, related_name="lessons", on_delete=models.CASCADE)
```

**Key Points**:
- Lessons belong to modules
- Modules belong to courses
- Lesson deletion cascades from Module deletion

### Relationship Diagram

```
User ──1:N── Enrollment ──M:N── Lesson
                │                   │
                │                   │
                └──N:1── Course ────┘
                                    │
                            Module ─┘
```

**Data Flow for Completion**:
1. Student marks lesson complete
2. Backend finds Enrollment(student=X, course=Y)
3. Backend adds lesson to enrollment.completed_lessons
4. Frontend refetches to verify persistence

---

## Frontend State Model (Changes Required)

### Current State Structure (Broken)

```typescript
// frontend/plantform/src/hooks/useProgress.ts
interface ProgressState {
  completedLessons: number[]     // Array of lesson IDs
  loading: boolean
  error: string | null
}
```

**Problem**: `completedLessons` is a flat array with no course association, causing cross-course contamination in progress calculations.

### Fixed State Structure (Proposed)

```typescript
// frontend/plantform/src/hooks/useProgress.ts
interface ProgressState {
  completedLessons: number[]     // Global array of ALL completed lesson IDs
  loading: boolean
  error: string | null
}

// NEW: Helper function to get course-specific completions
function getCourseCompletedLessons(
  allCompletedIds: number[],
  courseLessons: Lesson[]
): number[] {
  const courseLessonIds = new Set(courseLessons.map(l => l.id))
  return allCompletedIds.filter(id => courseLessonIds.has(id))
}
```

**Rationale**:
- Maintains simplicity (no nested state structure)
- Course filtering happens at calculation time, not storage time
- Backward compatible with existing components
- Minimal refactoring required

**Alternative Considered (Rejected)**:
```typescript
interface ProgressState {
  completionsByCourse: Record<number, number[]>  // { courseId: [lessonIds] }
}
```
Rejected because:
- Requires major refactor of all consuming components
- Violates "minimal changes" constraint
- Backend returns flat array, so we'd need to build this structure client-side anyway

---

## API Response Contracts (Existing)

### GET /api/progress/completed-lessons/

**Current Response** (from backend):
```json
{
  "message": "Completed lessons retrieved successfully",
  "count": 3,
  "results": [
    {
      "id": 1,
      "title": "Introduction to Python",
      "content_markdown": "# Welcome\nThis is markdown content...",
      "video_file": "/media/lesson_videos/intro.mp4",
      "order": 1,
      "module": 5
    },
    {
      "id": 2,
      "title": "Variables and Data Types",
      "content_markdown": "## Variables\nPython variables...",
      "video_file": "/media/lesson_videos/variables.mp4",
      "order": 2,
      "module": 5
    }
  ]
}
```

**Fixed Frontend Parsing**:
```typescript
// BEFORE (broken):
return response.data.completed_lessons || []

// AFTER (fixed):
return response.data.results?.map((lesson: Lesson) => lesson.id) || []
```

**Type Definition**:
```typescript
interface CompletedLessonsResponse {
  message: string
  count: number
  results: Lesson[]
}

interface Lesson {
  id: number
  title: string
  content_markdown: string
  video_file: string | null
  order: number
  module: number
}
```

---

### POST /api/lessons/{id}/complete/

**Request**: No body (lesson ID in URL)

**Response** (Success):
```json
{
  "message": "Lesson marked as completed"
}
```

**Response** (Error - Not Enrolled):
```json
{
  "detail": "Not enrolled"
}
```

**Status Codes**:
- 200 OK: Lesson marked complete
- 403 Forbidden: Student not enrolled in course
- 404 Not Found: Lesson doesn't exist

---

### DELETE /api/lessons/{id}/complete/

**Request**: No body (lesson ID in URL)

**Response** (Success):
```json
{
  "message": "Lesson marked as incomplete"
}
```

**Status Codes**:
- 200 OK: Lesson marked incomplete
- 403 Forbidden: Student not enrolled in course
- 404 Not Found: Lesson doesn't exist

---

## State Transitions

### Lesson Completion Lifecycle

```
┌─────────────┐
│             │
│  Incomplete │ ◄──────────────┐
│             │                │
└──────┬──────┘                │
       │                       │
       │ Student clicks        │
       │ "Mark Complete"       │
       │                       │
       ▼                       │
┌─────────────┐                │
│             │                │
│  Completing │ ──Error────────┤
│ (Optimistic)│                │
│             │                │
└──────┬──────┘                │
       │                       │
       │ API Success           │
       │                       │
       ▼                       │
┌─────────────┐                │
│             │                │
│  Completed  │                │
│             │                │
└──────┬──────┘                │
       │                       │
       │ Student clicks        │
       │ "Mark Incomplete"     │
       │                       │
       └───────────────────────┘
```

**State Management Rules**:
1. **Optimistic Update**: UI changes immediately before API call
2. **Error Reversion**: UI reverts if API call fails
3. **Server as Source of Truth**: Page refresh always fetches from backend
4. **No Local Storage**: State exists only in memory (session-scoped)

---

## Data Validation Rules

### Frontend Validation

**Before Marking Complete**:
- Lesson ID must be a positive integer
- User must be authenticated (JWT token present)
- Lesson must belong to a course the user is viewing

**Progress Calculation**:
- Total lessons must be ≥ 0
- Completed lessons count must be ≤ total lessons
- Progress percentage: `Math.round((completed / total) * 100)` capped at 100

### Backend Validation (Existing - No Changes)

**Enrollment Check**:
- User must have an active Enrollment record for the course
- Enforced in `EnrollmentService.mark_lesson_completed()`

**Lesson Existence**:
- Lesson ID must exist in database
- Enforced by Django ORM (404 if not found)

---

## Data Flow Diagrams

### Fix 1: Correct Data Parsing

```
┌─────────────┐
│   Backend   │
│   Returns   │
│  {results:  │
│  [Lesson]}  │
└──────┬──────┘
       │
       │ HTTP Response
       │
       ▼
┌─────────────────────────┐
│  progress.service.ts    │
│  ❌ OLD: data.completed_lessons  │
│  ✅ NEW: data.results.map(l => l.id) │
└──────┬──────────────────┘
       │
       │ number[]
       │
       ▼
┌─────────────────────────┐
│  useProgress Hook       │
│  setCompletedLessons([ids]) │
└──────┬──────────────────┘
       │
       │ completedLessons state
       │
       ▼
┌─────────────────────────┐
│  UI Components          │
│  - LearningView         │
│  - LessonSidebar        │
│  - Dashboard            │
└─────────────────────────┘
```

---

### Fix 2: Course-Specific Progress Calculation

```
┌─────────────┐           ┌─────────────┐
│ Global      │           │  Course     │
│ Completed   │           │  Lessons    │
│ Lesson IDs  │           │  (from API) │
│ [1,2,5,7,9] │           │ [1,2,3,4,5] │
└──────┬──────┘           └──────┬──────┘
       │                         │
       └────────┬────────────────┘
                │
                │ Filter
                │
                ▼
       ┌──────────────────┐
       │ Course-Specific  │
       │ Completed IDs    │
       │ [1, 2, 5]        │
       │                  │
       │ Progress:        │
       │ 3/5 = 60%        │
       └──────────────────┘
```

---

### Fix 3: Error Handling with UI Reversion

```
1. User clicks "Mark Complete" button
   ↓
2. Optimistic Update: completedLessons = [...prev, newId]
   UI shows "Completed ✓"
   ↓
3. API Call: POST /api/lessons/{id}/complete/
   ↓
   ├─ Success (200 OK)
   │  → Keep optimistic update
   │  → User sees "Completed ✓"
   │
   └─ Error (403/404/500)
      → Revert: completedLessons = prev.filter(id => id !== newId)
      → UI shows "Incomplete ○"
      → Toast: "Failed to mark lesson complete. Please try again."
```

---

## Entity Relationships (Frontend)

### Type Definitions

```typescript
// frontend/plantform/src/types/index.ts

interface User {
  id: number
  username: string
  email: string
  role: 'student' | 'instructor'
}

interface Course {
  id: number
  title: string
  description: string
  instructor: User
  modules: Module[]
  lessons_count: number  // Total lessons in course
}

interface Module {
  id: number
  title: string
  order: number
  course: number  // Course ID
  lessons: Lesson[]
}

interface Lesson {
  id: number
  title: string
  content_markdown: string
  video_file: string | null
  order: number
  module: number  // Module ID
}

interface Enrollment {
  id: number
  student: number  // User ID
  course: number   // Course ID
  enrolled_at: string  // ISO date
  completed_lessons: number[]  // Lesson IDs
  course_details?: Course  // Populated in some endpoints
}
```

---

## Migration Notes

**Database Migrations**: None required ✅

**Frontend Migrations**: None required (code changes only)

**Data Migration**: None required (existing completion data remains valid)

**Backward Compatibility**: Fully compatible (fixes broken functionality, doesn't change working features)

---

## Summary

This bug fix requires **zero data model changes**. The backend schema is correct; the issue is purely in frontend state management and API response parsing. Key fixes:

1. **Data Parsing**: Extract IDs from `response.data.results` instead of non-existent `.completed_lessons`
2. **Progress Calculation**: Filter global completions by course lessons before calculating percentage
3. **Error Handling**: Add try-catch with state reversion + user notification

**Next**: Generate API contracts documentation (contracts/progress-api.yaml)
