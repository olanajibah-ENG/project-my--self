# Implementation Plan: Instructor Content Management Workflow

**Branch**: `001-instructor-content-workflow` | **Date**: 2026-01-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-instructor-content-workflow/spec.md`

## Summary

Fix instructor content management workflow focusing on course → module → lesson creation and editing. The primary issues are:
1. HTTP 415 errors when creating lessons (Content-Type header mismatch)
2. Missing field validation (title max 200 chars, description max 1000 chars)
3. Missing content size limits (50K chars for text, 10MB for files)
4. Missing session-based undo for deletions
5. Missing cascade deletion with confirmation for modules containing lessons

Technical approach: Fix backend parsers to accept JSON for non-file lesson creation, add validation at both frontend and backend, implement session-based undo state management in React.

## Technical Context

**Language/Version**: Python 3.13 (backend), TypeScript 5.9.3 (frontend)
**Primary Dependencies**: Django 6.0.1, Django REST Framework 3.16.1 (backend); React 19.2.0, Vite 6.0.0, Axios 1.7.0 (frontend)
**Storage**: SQLite3 (development) - existing models for Course, Module, Lesson
**Testing**: Not currently configured - needs setup with pytest (backend) and vitest (frontend)
**Target Platform**: Web application - modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <2s for content save operations, <1s for reorder operations (per SC-004, SC-006)
**Constraints**: 50 concurrent instructors (SC-007), session-based undo (not persistent)
**Scale/Scope**: Single-tenant educational platform, MVP feature set

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: Project constitution is not yet defined (template placeholders only). Proceeding with standard best practices:

| Principle | Status | Notes |
|-----------|--------|-------|
| Code Organization | ✓ Pass | Using existing Django/React structure |
| API Design | ✓ Pass | Following established REST patterns with DRF |
| Testing | ⚠ Needs Setup | No test framework configured - will add pytest/vitest |
| Security | ✓ Pass | Using existing permission classes (IsInstructorOwner, etc.) |
| Simplicity | ✓ Pass | Fixing existing code rather than rewriting |

## Project Structure

### Documentation (this feature)

```text
specs/001-instructor-content-workflow/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI specs)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── edupro/              # Django project settings
│   ├── settings.py
│   └── urls.py
├── plantform/           # Main Django app
│   ├── models/
│   │   ├── course.py    # Course model (exists)
│   │   ├── module.py    # Module model (exists)
│   │   ├── lesson.py    # Lesson model (needs updates)
│   │   └── user.py      # User model with INSTRUCTOR/STUDENT roles
│   ├── views/
│   │   ├── course_views.py
│   │   ├── module_views.py
│   │   └── lesson_views.py   # Fix 415 error here
│   ├── serializers/
│   │   ├── course_serializers.py
│   │   ├── module_serializers.py
│   │   └── lesson_serializers.py  # Add validation
│   └── permissions.py   # Existing permission classes
└── tests/               # New - needs setup
    ├── conftest.py
    ├── test_courses.py
    ├── test_modules.py
    └── test_lessons.py

frontend/plantform/
├── src/
│   ├── components/
│   │   ├── common/      # Shared UI components
│   │   └── instructor/  # Instructor-specific components
│   ├── pages/
│   │   └── instructor/
│   │       ├── CourseBuilder.tsx    # Main course editing page
│   │       └── LessonEditor.tsx     # Lesson editing
│   ├── services/
│   │   ├── course.service.ts
│   │   ├── module.service.ts
│   │   └── lesson.service.ts        # Fix Content-Type issue
│   ├── hooks/
│   │   └── useUndoStack.ts          # New - session-based undo
│   ├── lib/
│   │   └── api.ts                   # Axios instance
│   └── types/
│       └── index.ts                 # TypeScript interfaces
└── tests/                           # New - needs setup
```

**Structure Decision**: Web application (Option 2) - using existing `backend/` and `frontend/plantform/` structure.

## Complexity Tracking

No constitution violations requiring justification. This implementation:
- Fixes existing bugs (415 error)
- Adds validation to existing endpoints
- Adds undo state management (client-side only)
- No new external dependencies required
