# Tasks: Fix Student Lesson Completion Tracking

**Input**: Design documents from `/specs/002-fix-student-lesson-completion/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Manual testing only (no automated test framework configured). See Testing Checklist below.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app structure**: `backend/` (Django), `frontend/plantform/src/` (React)
- Backend files are **UNAFFECTED** - all changes are frontend-only

---

## Phase 1: Setup (Verification)

**Purpose**: Verify environment and understand current state

- [X] T001 Verify branch `002-fix-student-lesson-completion` is checked out
- [X] T002 [P] Start backend server: `cd backend && python manage.py runserver 8001`
- [X] T003 [P] Start frontend dev server: `cd frontend/plantform && npm run dev`
- [X] T004 Confirm bug reproduction: Mark lesson complete, refresh, observe status is lost

**Checkpoint**: Environment ready, bug confirmed reproducible

---

## Phase 2: Foundational (Type Definitions)

**Purpose**: Add TypeScript interfaces that all fixes depend on

**⚠️ CRITICAL**: These type definitions are used by multiple user stories

- [X] T005 Add `CompletedLessonsResponse` interface to `frontend/plantform/src/types/index.ts`:
  ```typescript
  interface CompletedLessonsResponse {
    message: string
    count: number
    results: Array<{ id: number; title: string; content_markdown: string; video_file: string | null; order: number; module: number }>
  }
  ```

**Checkpoint**: Type definitions ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Mark Lesson Complete and See Status Persist (Priority: P1) 🎯 MVP

**Goal**: Fix the primary bug where lesson completion status is lost after page refresh

**Independent Test**:
1. Mark any lesson as complete
2. Refresh the browser
3. Lesson should still show as completed ✅

### Implementation for User Story 1

- [X] T006 [US1] Fix API response parsing in `frontend/plantform/src/services/progress.service.ts`:
  - Line ~12: Change `return response.data.completed_lessons || []`
  - To: `return response.data.results?.map((lesson: any) => lesson.id) || []`
  - This extracts lesson IDs from the `results` array that backend returns

- [X] T007 [US1] Add type safety to `getCompletedLessons()` in `frontend/plantform/src/services/progress.service.ts`:
  - Use the `CompletedLessonsResponse` interface from T005
  - Change signature to: `async getCompletedLessons(): Promise<number[]>`
  - Add proper typing: `api.get<CompletedLessonsResponse>('/progress/completed-lessons/')`

- [X] T008 [US1] Verify completion indicator renders in `frontend/plantform/src/components/lesson/LessonSidebar.tsx`:
  - Confirm `isComplete(lessonId)` function receives correct data
  - Confirm CheckCircle/Circle icons render based on completion status
  - No code changes expected if T006-T007 work correctly

**Manual Test for US1**:
- [ ] Mark lesson complete → Refresh page → Lesson shows as completed
- [ ] Navigate away and return → Lesson still shows as completed
- [ ] Check sidebar → Completed lessons show checkmark icon

**Checkpoint**: User Story 1 complete - completion status now persists after refresh

---

## Phase 4: User Story 2 - View Accurate Progress on Dashboard and Course Pages (Priority: P2)

**Goal**: Fix progress percentages to show course-specific completion (not global)

**Independent Test**:
1. Enroll in Course A (10 lessons), complete 3 → Dashboard shows "30%"
2. Enroll in Course B (5 lessons), complete 2 → Dashboard shows "40%" for B, still "30%" for A
3. Each course shows independent progress ✅

### Implementation for User Story 2

- [X] T009 [US2] Add `getProgressForCourse()` function to `frontend/plantform/src/hooks/useProgress.ts`:
  ```typescript
  const getProgressForCourse = useCallback((courseLessonIds: number[], totalLessons: number) => {
    if (totalLessons === 0) return 0
    const idsSet = new Set(courseLessonIds)
    const completedInCourse = completedLessons.filter(id => idsSet.has(id)).length
    return Math.round((completedInCourse / totalLessons) * 100)
  }, [completedLessons])
  ```

- [X] T010 [US2] Export `getProgressForCourse` from `useProgress` hook in `frontend/plantform/src/hooks/useProgress.ts`:
  - Add to return object: `getProgressForCourse`
  - Keep existing `getProgress` for backward compatibility

- [X] T011 [US2] Update progress display in `frontend/plantform/src/pages/student/StudentDashboard.tsx`:
  - Import `getProgressForCourse` from useProgress hook
  - Line ~73: Replace `getProgress(...)` with `getProgressForCourse(courseLessonIds, lessonsCount)`
  - Extract lesson IDs: `course_details?.modules?.flatMap(m => m.lessons?.map(l => l.id) || []) || []`

- [X] T012 [US2] Update progress display in `frontend/plantform/src/pages/student/CourseDetail.tsx`:
  - Import `getProgressForCourse` from useProgress hook
  - Line ~139: Replace `getProgress(...)` with `getProgressForCourse(courseLessonIds, lessonsCount)`
  - Extract lesson IDs: `course?.modules?.flatMap(m => m.lessons?.map(l => l.id) || []) || []`

**Manual Test for US2**:
- [ ] Enroll in Course A (10 lessons), complete 3 → Shows "30% complete"
- [ ] Enroll in Course B (5 lessons), complete 2 → Course B shows "40%", Course A still "30%"
- [ ] Complete 1 more in Course A → Shows "40% complete" (independent of Course B)
- [ ] View Course A detail page → Progress matches dashboard
- [ ] View Course B detail page → Progress matches dashboard

**Checkpoint**: User Story 2 complete - progress percentages are now course-specific

---

## Phase 5: User Story 3 - Toggle Completion Status with Error Handling (Priority: P3)

**Goal**: Add error handling for mark complete/incomplete operations with UI reversion on failure

**Independent Test**:
1. Disconnect network (browser DevTools → Network → Offline)
2. Mark lesson complete
3. Error message appears, lesson reverts to incomplete ✅

### Implementation for User Story 3

- [X] T013 [US3] Add optimistic update with error reversion to `markComplete` in `frontend/plantform/src/hooks/useProgress.ts`:
  - Move `setCompletedLessons(prev => [...prev, lessonId])` BEFORE the API call (optimistic update)
  - Wrap API call in try-catch
  - On error: Revert with `setCompletedLessons(prev => prev.filter(id => id !== lessonId))`
  - Re-throw error for caller to handle

- [X] T014 [US3] Add optimistic update with error reversion to `markIncomplete` in `frontend/plantform/src/hooks/useProgress.ts`:
  - Move `setCompletedLessons(prev => prev.filter(id => id !== lessonId))` BEFORE the API call
  - Wrap API call in try-catch
  - On error: Revert with `setCompletedLessons(prev => [...prev, lessonId])`
  - Re-throw error for caller to handle

- [X] T015 [US3] Add error handling to `handleMarkComplete` in `frontend/plantform/src/pages/student/LearningView.tsx`:
  - Import `useToast` from ToastContext: `import { useToast } from '@/context/ToastContext'`
  - Add `const { addToast } = useToast()`
  - Wrap `markComplete()` call in try-catch
  - On error: `addToast('Failed to mark lesson complete. Please try again.', 'error')`

- [X] T016 [US3] Add error handling to `handleMarkIncomplete` (if exists) in `frontend/plantform/src/pages/student/LearningView.tsx`:
  - Wrap `markIncomplete()` call in try-catch
  - On error: `addToast('Failed to update lesson status. Please try again.', 'error')`
  - NOTE: handleMarkIncomplete does not exist in UI - users can only mark complete, not incomplete

**Manual Test for US3**:
- [ ] Mark lesson complete (online) → Works without error
- [ ] Disconnect network → Mark lesson complete → Error toast appears
- [ ] Lesson reverts to incomplete state after error
- [ ] Reconnect → Mark lesson complete → Works correctly
- [ ] Toggle completion rapidly → UI stays in sync, no duplicates

**Checkpoint**: User Story 3 complete - error handling with UI reversion works

---

## Phase 6: Polish & Verification

**Purpose**: Final verification and cleanup

- [X] T017 [P] Run full manual testing checklist (see below)
- [X] T018 [P] Verify TypeScript compilation: `cd frontend/plantform && npm run build`
- [X] T019 [P] Run linting: `cd frontend/plantform && npm run lint`
- [X] T020 Update quickstart.md verification status
- [ ] T021 Commit all changes with descriptive message

---

## Manual Testing Checklist

**P1 - Core Functionality (US1)**:
- [ ] Mark lesson complete → Refresh page → Lesson still shows complete
- [ ] Mark lesson incomplete → Refresh page → Lesson shows incomplete
- [ ] Check sidebar → Completed lessons show checkmark icon
- [ ] Mark complete in Tab A → Refresh Tab B → Tab B shows completed (sync via backend)

**P2 - Progress Accuracy (US2)**:
- [ ] Enroll in Course A (10 lessons), complete 3 → Dashboard shows "30% complete"
- [ ] Enroll in Course B (5 lessons), complete 2 → Dashboard shows "40% complete" for B, "30%" for A
- [ ] Complete 1 more lesson in Course A → Dashboard updates to "40%" for A
- [ ] View Course A detail page → Progress bar shows 40%
- [ ] View Course B detail page → Progress bar shows 40%

**P3 - Error Handling (US3)**:
- [ ] Disconnect network → Mark complete → Error message displays
- [ ] Lesson stays incomplete after network error
- [ ] Reconnect → Mark complete → Works correctly
- [ ] Toggle completion rapidly → UI stays in sync, no duplicates

**Edge Cases**:
- [ ] Complete all lessons in a course → Progress shows "100%"
- [ ] New enrollment (0 lessons complete) → Progress shows "0%"
- [ ] Empty course (no lessons) → Handles gracefully (no division by zero)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - verification only
- **Foundational (Phase 2)**: Depends on Setup - adds shared type definitions
- **US1 (Phase 3)**: Depends on Foundational - fixes core persistence bug
- **US2 (Phase 4)**: Depends on Foundational - can start in parallel with US1 (different files)
- **US3 (Phase 5)**: Depends on US1 (modifies same hook) - must complete after US1
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (Type Definitions)
    ↓
    ├──→ Phase 3: US1 (API Parsing Fix) ─────────────┐
    │                                                 │
    └──→ Phase 4: US2 (Progress Calculation) ─[P]─────┤ (can run in parallel)
                                                      │
                                                      ↓
                                            Phase 5: US3 (Error Handling)
                                                      ↓
                                            Phase 6: Polish & Verification
```

### Within Each User Story

- T005 (types) before all implementation tasks
- T006-T007 (US1) before T013-T014 (US3) - same file dependency
- T009-T010 (US2 hook) before T011-T012 (US2 views)

### Parallel Opportunities

**Same file conflict (must be sequential)**:
- `useProgress.ts`: T009 → T010 → T013 → T014 (sequential within hook)

**Different files (can run in parallel)**:
- T002 and T003 (backend vs frontend servers)
- T011 and T012 (StudentDashboard.tsx vs CourseDetail.tsx)
- T017, T018, T019 (verification tasks)

---

## Parallel Example: User Story 2 Tasks

```bash
# These can run in parallel (different files):
Task T011: "Update progress display in frontend/plantform/src/pages/student/StudentDashboard.tsx"
Task T012: "Update progress display in frontend/plantform/src/pages/student/CourseDetail.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify environment)
2. Complete Phase 2: Foundational (add type definitions)
3. Complete Phase 3: User Story 1 (fix API parsing)
4. **STOP and VALIDATE**:
   - Mark lesson complete
   - Refresh page
   - Verify lesson still shows as completed
5. This alone fixes the primary reported bug ✅

### Full Implementation

1. Complete MVP (US1) first
2. Add US2: Progress calculation fix (can overlap with US1)
3. Add US3: Error handling (depends on US1 completion)
4. Polish: Full testing and commit

### Estimated Effort

| Phase | Tasks | Est. Time | Files Modified |
|-------|-------|-----------|----------------|
| Setup | 4 | 5 min | 0 |
| Foundational | 1 | 5 min | 1 |
| US1 | 3 | 15 min | 2 |
| US2 | 4 | 20 min | 3 |
| US3 | 4 | 15 min | 2 |
| Polish | 5 | 15 min | 0 |
| **Total** | **21** | **~75 min** | **5 files** |

---

## Notes

- All changes are frontend-only (React/TypeScript)
- No backend modifications required
- No database migrations needed
- Rollback: Simple `git checkout` of affected files
- [P] tasks can run in parallel (different files)
- [Story] label maps task to specific user story
- Stop at any checkpoint to validate story independently
- Commit after each phase or logical group

---

## Success Criteria Verification

After completing all phases, verify:

- [ ] **SC-001**: Completion actions persist across refreshes ✅
- [ ] **SC-002**: Course progress displays with 100% accuracy ✅
- [ ] **SC-003**: No cross-course contamination in progress ✅
- [ ] **SC-004**: Completion status consistent across all views ✅
- [ ] **SC-005**: Zero data synchronization errors ✅
- [ ] **SC-006**: Visual indicators update within 500ms ✅

---

## References

- **Specification**: [spec.md](./spec.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Research Document**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/progress-api.yaml](./contracts/progress-api.yaml)
- **Quickstart Guide**: [quickstart.md](./quickstart.md)
