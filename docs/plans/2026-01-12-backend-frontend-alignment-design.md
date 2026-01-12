# OlaLearn Backend-Frontend Alignment Design

## Overview

Align the backend API with frontend expectations after the OlaLearn rebrand. The frontend has been refactored with new features, but the backend doesn't support all required endpoints and the frontend has role-based UI issues.

## Goals

1. Fix all missing backend API endpoints and filters
2. Add proper backend permission enforcement (security-critical)
3. Fix frontend role-based UI issues (ownership, enrollment checks)
4. Ensure clean integration without over-engineering

## Approach

**Backend-First** - Fix backend gaps and security first, then update frontend.

---

## Backend Changes

### 1. Enrollments Endpoint

**New ViewSet:** `EnrollmentViewSet` at `/api/enrollments/`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/enrollments/` | List user's enrollments (with nested course details) |
| `GET` | `/enrollments/?course=<id>` | Check if enrolled in specific course |

**Queryset filtering:**
- Students see only their own enrollments
- Instructors see enrollments for their courses (to see student counts)

### 2. Course Serializer Enhancements

Add computed fields to `CourseSerializer`:

| Field | Type | Description |
|-------|------|-------------|
| `instructor_name` | string | From `instructor.username` |
| `modules_count` | integer | Count of modules |
| `lessons_count` | integer | Sum of lessons across all modules |
| `enrolled_count` | integer | Count of enrollments |
| `is_enrolled` | boolean | Is current user enrolled (context-aware) |
| `is_owner` | boolean | Is current user the instructor (context-aware) |

### 3. Query Parameter Filtering

Add `django-filter` support:

| Endpoint | Filter Param | Purpose |
|----------|--------------|---------|
| `/courses/` | `?my_courses=true` | Instructor's own courses only |
| `/modules/` | `?course=<id>` | Modules for specific course |
| `/lessons/` | `?module=<id>` | Lessons for specific module |
| `/enrollments/` | `?course=<id>` | Check enrollment for course |

### 4. Lesson Completion Enhancement

**Current:** `POST /lessons/:id/complete/` only

**Add:** `DELETE /lessons/:id/complete/` to unmark as complete

```python
@action(detail=True, methods=["post", "delete"])
def complete(self, request, pk=None):
    if request.method == "POST":
        # Mark complete
    elif request.method == "DELETE":
        # Remove from completed_lessons
```

### 5. Reorder Endpoints

New actions on existing ViewSets:

| Endpoint | Request Body | Purpose |
|----------|--------------|---------|
| `POST /modules/reorder/` | `{ course: id, module_ids: [1,3,2] }` | Bulk update module order |
| `POST /lessons/reorder/` | `{ module: id, lesson_ids: [5,4,6] }` | Bulk update lesson order |

### 6. Login Response Enhancement

Add `email` to JWT token response in `CustomTokenSerializer`:

```python
data["email"] = self.user.email
```

### 7. Token Refresh Enhancement

Include user data in refresh response for role sync:

```python
# CustomTokenRefreshSerializer
data["username"] = self.user.username
data["role"] = self.user.role
data["user_id"] = self.user.id
data["email"] = self.user.email
```

### 8. Backend Permission Enforcement

**Critical security additions:**

| View | Permission | Check |
|------|------------|-------|
| `CourseViewSet.update/delete` | `IsInstructorOwner` | `course.instructor == request.user` |
| `ModuleViewSet.create/update/delete` | `IsInstructorOwner` | Module's course instructor check |
| `LessonViewSet.create/update/delete` | `IsInstructorOwner` | Lesson's module's course instructor check |
| `LessonViewSet.complete` | `IsEnrolledStudent` | Student must be enrolled in course |

### 9. Error Messages

| Scenario | Status | Message |
|----------|--------|---------|
| Not course owner | 403 | "You don't have permission to edit this course" |
| Not enrolled | 403 | "You must enroll in this course first" |
| Already enrolled | 400 | "You are already enrolled in this course" |

---

## Frontend Changes

### 1. CourseDetail Page - Show Correct Actions

Use `is_owner` and `is_enrolled` fields from backend:

```tsx
if (course.is_owner) {
  // Show "Edit Course" button
} else if (course.is_enrolled) {
  // Show "Continue Learning" button
} else {
  // Show "Enroll" button
}
```

### 2. CourseBuilder - Ownership Validation

After fetching course, verify ownership:

```tsx
if (courseData.instructor !== user.id) {
  navigate('/instructor/dashboard')
  toast.error("You don't have permission to edit this course")
  return
}
```

### 3. LearningView - Enrollment Validation

Check enrollment before rendering lessons:

```tsx
if (!course.is_enrolled && user.role === 'student') {
  navigate(`/courses/${id}`)
  return
}
// Allow instructors to preview their own courses
```

### 4. Token Refresh - Role Sync

Update AuthContext on token refresh:

```tsx
// api.ts interceptor - on successful refresh
if (response.data.role) {
  const user = {
    id: response.data.user_id,
    username: response.data.username,
    email: response.data.email,
    role: response.data.role
  }
  localStorage.setItem('user', JSON.stringify(user))
}
```

### 5. Type Updates

Add new fields to Course type:

```typescript
interface Course {
  // existing fields...
  instructor_name?: string
  modules_count?: number
  lessons_count?: number
  enrolled_count?: number
  is_enrolled?: boolean
  is_owner?: boolean
}
```

---

## What We're NOT Adding (YAGNI)

- No pagination (frontend doesn't use it)
- No course categories/tags
- No user profile editing
- No course publishing workflow (draft/published states)
- No analytics beyond simple counts

---

## Implementation Order

1. **Backend: Add django-filter dependency**
2. **Backend: Enhance CourseSerializer with computed fields**
3. **Backend: Add EnrollmentViewSet with filtering**
4. **Backend: Add query param filtering to modules/lessons**
5. **Backend: Add DELETE method to lesson complete action**
6. **Backend: Add reorder endpoints**
7. **Backend: Enhance JWT responses (login + refresh)**
8. **Backend: Verify/add permission enforcement**
9. **Frontend: Update types**
10. **Frontend: Fix CourseDetail role-based UI**
11. **Frontend: Add ownership check to CourseBuilder**
12. **Frontend: Add enrollment check to LearningView**
13. **Frontend: Update token refresh handler**
14. **Integration testing**

---

## Files to Modify

### Backend
- `backend/plantform/serializers/course_serializers.py` - Add computed fields
- `backend/plantform/serializers/enrollment_serializers.py` - Enhance for list view
- `backend/plantform/views/course_views.py` - Add filtering
- `backend/plantform/views/module_views.py` - Add filtering + reorder
- `backend/plantform/views/lesson_views.py` - Add filtering + reorder + DELETE complete
- `backend/plantform/views/enrollment_views.py` - New EnrollmentViewSet
- `backend/plantform/serializers/auth_serializers.py` - Add email to JWT
- `backend/plantform/permissions.py` - Verify ownership permissions
- `backend/plantform/urls.py` - Register new endpoints
- `backend/edupro/settings.py` - Add django-filter
- `backend/requirements.txt` - Add django-filter

### Frontend
- `frontend/plantform/src/types/index.ts` - Add new Course fields
- `frontend/plantform/src/pages/student/CourseDetail.tsx` - Role-based UI
- `frontend/plantform/src/pages/instructor/CourseBuilder.tsx` - Ownership check
- `frontend/plantform/src/pages/student/LearningView.tsx` - Enrollment check
- `frontend/plantform/src/lib/api.ts` - Token refresh role sync
