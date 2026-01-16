# Implementation Plan: Fix Student Lesson Completion Tracking

**Branch**: `002-fix-student-lesson-completion` | **Date**: 2026-01-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-fix-student-lesson-completion/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan addresses critical bugs in the student lesson completion tracking system where completion status does not persist across page refreshes and progress percentages display incorrectly. The root cause is a data format mismatch between backend and frontend: the backend returns full Lesson objects while the frontend expects an array of lesson IDs. The fix involves correcting the API response format, implementing proper error handling for network failures, and ensuring course-specific progress calculations.

**Primary Issues**:
1. **Data Format Mismatch** (`frontend/plantform/src/services/progress.service.ts:12`): Frontend expects `response.data.completed_lessons` (ID array) but backend returns `response.data.results` (Lesson objects)
2. **Progress Calculation Error**: Uses global `completedLessons` array across all courses instead of filtering by specific course
3. **Missing Error Handling**: No user feedback on network failures during lesson completion

**Technical Approach**: Fix the frontend service layer to correctly parse backend responses, update progress calculation hooks to filter by course ID, and add error handling with UI reversion on failures. No backend API changes required; all fixes are frontend-only.

## Technical Context

**Language/Version**: Python 3.13.7 (backend), TypeScript 5.9.3 (frontend)

**Primary Dependencies**:
- Backend: Django 6.0.1, Django REST Framework 3.16.1, djangorestframework-simplejwt 5.5.1
- Frontend: React 19.2.0, Axios 1.7.0, React Router 7.12.0, Vite 6.0.0

**Storage**: SQLite 3 (development), Django ORM with ManyToMany relationship (Enrollment.completed_lessons → Lesson)

**Testing**:
- Backend: Django's built-in TestCase (currently minimal tests in place)
- Frontend: No testing framework currently configured

**Target Platform**: Web application (server-rendered backend API + SPA frontend)

**Project Type**: Web (monorepo with backend/ and frontend/ directories)

**Performance Goals**:
- Lesson completion persistence within 2 seconds (SC-001)
- UI updates within 500ms after completion action (SC-006)
- Zero data synchronization errors (SC-005)

**Constraints**:
- No breaking changes to database schema
- Must preserve existing API endpoints
- Minimal changes (bug fix iteration, not redesign)
- No offline functionality or sync mechanisms
- No new UI components or major UX overhauls

**Scale/Scope**:
- Current: SQLite database (196 KB), suitable for <100 concurrent users
- Affects: Student learning workflow, progress tracking across all courses and lessons
- Components: 3 frontend files (service, hook, views), 0 backend files (API already correct)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: No constitution file exists (template placeholders found)

**Assessment**: Since no project constitution has been ratified, no gates apply. However, following general best practices:

✅ **Minimal Changes**: Aligns with spec constraint ("minimal and focused on fixing existing functionality")
✅ **No Breaking Changes**: Preserves existing API contracts and database schema
✅ **Test-Aware**: Plan includes verification steps for each fix
⚠️ **Testing Infrastructure Gap**: No automated test framework configured (documented risk, not a blocker for bug fix)

**Constitution Check Result**: ✅ PASS (no constitution gates to evaluate)

**Re-check Required After Phase 1**: Verify that design maintains compatibility constraints

## Project Structure

### Documentation (this feature)

```text
specs/002-fix-student-lesson-completion/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (generated below)
├── data-model.md        # Phase 1 output (generated below)
├── quickstart.md        # Phase 1 output (generated below)
├── contracts/           # Phase 1 output (generated below)
│   └── progress-api.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
```

### Source Code (repository root)

```text
# Web application structure
backend/
├── edupro/              # Django project settings
├── plantform/           # Main Django app
│   ├── models/
│   │   ├── enrollment.py      # Enrollment.completed_lessons ManyToMany
│   │   └── lesson.py          # Lesson model
│   ├── views/
│   │   ├── lesson_views.py    # LessonViewSet.complete() action (UNAFFECTED)
│   │   └── enrollment_views.py # CompletedLessonsView (UNAFFECTED)
│   ├── serializers/
│   │   └── enrollment_serializers.py # EnrollmentSerializer (UNAFFECTED)
│   ├── services/
│   │   └── enrollment_service.py # mark_lesson_completed() (UNAFFECTED)
│   └── urls.py
├── media/               # User-uploaded lesson videos
├── db.sqlite3          # SQLite database
└── requirements.txt

frontend/
└── plantform/
    ├── src/
    │   ├── components/
    │   │   └── lesson/
    │   │       └── LessonSidebar.tsx  # Shows completion checkmarks (UPDATE)
    │   ├── hooks/
    │   │   └── useProgress.ts         # Progress state management (UPDATE)
    │   ├── pages/
    │   │   └── student/
    │   │       ├── LearningView.tsx   # Mark complete button (UPDATE)
    │   │       ├── StudentDashboard.tsx # Progress display (UPDATE)
    │   │       └── CourseDetail.tsx   # Progress display (UPDATE)
    │   ├── services/
    │   │   └── progress.service.ts    # API calls (FIX PRIMARY BUG)
    │   └── types/
    │       └── index.ts               # TypeScript interfaces (REVIEW)
    ├── package.json
    └── vite.config.ts

tests/ (NOT CURRENTLY PRESENT)
```

**Structure Decision**: This is a monorepo web application with Django REST API backend and React SPA frontend. The bug fix will be **frontend-only** - no backend changes required. The backend API already returns correct data; the frontend service layer is misinterpreting it.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations to track. This is a straightforward bug fix within existing architecture.

---

## Phase 0: Outline & Research ✅ COMPLETE

**Deliverable**: [research.md](./research.md)

**Research Questions Resolved**:
1. ✅ Root cause of persistence bug: Data format mismatch in `progress.service.ts:12`
2. ✅ Progress calculation strategy: Course-filtered progress using lesson ID sets
3. ✅ Error handling approach: Try-catch with optimistic update reversion + toast messages
4. ✅ Concurrent update handling: Last-write-wins (no client-side logic needed)
5. ✅ Type safety strategy: Define explicit TypeScript interfaces for API responses
6. ✅ Testing strategy: Manual testing checklist (no test framework configured yet)

**Key Decisions**:
- **Frontend-only fix**: Backend API is correct; all fixes in React code
- **Minimal changes**: No state management refactor, no new dependencies
- **Standard patterns**: Optimistic updates with error reversion (React Query pattern)
- **Type safety**: Add explicit interfaces for API contracts

---

## Phase 1: Design & Contracts ✅ COMPLETE

**Deliverables**:
- [data-model.md](./data-model.md) - Data structures and state flow
- [contracts/progress-api.yaml](./contracts/progress-api.yaml) - OpenAPI 3.0 contract for existing API
- [quickstart.md](./quickstart.md) - Step-by-step implementation guide
- [CLAUDE.md](../../CLAUDE.md) - Updated agent context (Python 3.13.7, TypeScript 5.9.3)

**Design Artifacts**:
1. ✅ **Data Model**: Documented existing backend schema + frontend state structure
2. ✅ **State Transitions**: Lesson completion lifecycle (Incomplete → Completing → Completed/Error)
3. ✅ **Data Flow Diagrams**: Visual representation of 3 bug fixes
4. ✅ **Type Definitions**: TypeScript interfaces for all API responses
5. ✅ **API Contracts**: OpenAPI spec documenting existing endpoints

**Architecture Decision**: Keep existing custom hooks + Context API pattern; no Redux/Zustand needed for this scale.

**Constitution Re-check**: ✅ PASS
- No breaking changes introduced
- Maintains existing API contracts
- Preserves database schema
- Follows minimal changes constraint

---

## Phase 2: Task Breakdown ⏳ PENDING

**Next Step**: Run `/speckit.tasks` to generate [tasks.md](./tasks.md)

**Expected Tasks** (preview):
1. Fix API response parsing in `progress.service.ts`
2. Add error handling to `useProgress` hook
3. Update `LearningView` to display error toasts
4. Implement course-filtered progress calculation
5. Update `StudentDashboard` progress display
6. Update `CourseDetail` progress display
7. Manual testing verification

---

## Implementation Summary

### Files to Modify (Priority Order)

| Priority | File | Lines | Change Type | Complexity |
|----------|------|-------|-------------|------------|
| **P1** | `frontend/plantform/src/services/progress.service.ts` | ~12 | Fix response parsing | Low |
| **P1** | `frontend/plantform/src/hooks/useProgress.ts` | ~24-40 | Add error handling | Medium |
| **P2** | `frontend/plantform/src/pages/student/LearningView.tsx` | ~54-58 | Add try-catch + toast | Low |
| **P2** | `frontend/plantform/src/pages/student/StudentDashboard.tsx` | ~73 | Update progress calc | Medium |
| **P2** | `frontend/plantform/src/pages/student/CourseDetail.tsx` | ~139 | Update progress calc | Medium |

**Total Estimated Changes**: ~80 lines of code across 5 files

---

## Verification Plan

### Automated Testing

**Current State**: No testing framework configured

**Future Recommendation**: Add Vitest for frontend testing (separate task)

### Manual Testing Checklist

**P1 - Critical Functionality**:
- [ ] Mark lesson complete → Refresh → Status persists
- [ ] Network failure → Error message + UI reversion
- [ ] Multiple tabs → Sync via backend on refresh

**P2 - Progress Accuracy**:
- [ ] Multi-course enrollment → Independent progress percentages
- [ ] Complete lessons → Progress updates correctly
- [ ] Dashboard + CourseDetail show same progress

**P3 - Edge Cases**:
- [ ] 100% completion → Shows "100%"
- [ ] New enrollment → Shows "0%"
- [ ] Rapid toggling → No state corruption

---

## Risk Assessment

### Low Risk ✅

- **Scope**: Frontend-only changes, no backend/database modifications
- **Scale**: ~80 lines of code across 5 files
- **Rollback**: Simple git revert, no migrations needed
- **Testing**: Manual testing sufficient for focused bug fix

### Mitigations

- **Type Safety**: TypeScript strict mode catches errors at compile time
- **Optimistic Updates**: Revert on error prevents false positives
- **Existing Patterns**: Uses established React patterns (hooks, context)

---

## Success Criteria (from Spec)

Verify each criterion after implementation:

- [ ] **SC-001**: 100% of completion actions persist across refreshes within 2s
- [ ] **SC-002**: Course progress displays with 100% accuracy
- [ ] **SC-003**: No cross-course contamination in progress percentages
- [ ] **SC-004**: Completion status consistent across all views
- [ ] **SC-005**: Zero data synchronization errors
- [ ] **SC-006**: Visual indicators update within 500ms

---

## Next Actions

1. **Generate Tasks**: Run `/speckit.tasks` to create task breakdown
2. **Begin Implementation**: Follow [quickstart.md](./quickstart.md) guide
3. **Test Thoroughly**: Use manual testing checklist
4. **Commit Changes**: Create descriptive commit message
5. **Deploy**: Standard frontend deployment (no backend changes)

---

## References

- **Specification**: [spec.md](./spec.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contract**: [contracts/progress-api.yaml](./contracts/progress-api.yaml)
- **Quickstart**: [quickstart.md](./quickstart.md)

---

**Plan Status**: ✅ COMPLETE (Phase 0 & 1)
**Next Command**: `/speckit.tasks`
**Branch**: `002-fix-student-lesson-completion`
**Updated**: 2026-01-13

