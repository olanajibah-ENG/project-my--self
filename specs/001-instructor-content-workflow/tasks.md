# Tasks: Instructor Content Management Workflow

**Input**: Design documents from `/specs/001-instructor-content-workflow/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested - test tasks are excluded. Testing framework setup included for future use.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/plantform/` (Django app)
- **Frontend**: `frontend/plantform/src/` (React/Vite app)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and shared component setup

- [X] T001 Create shared ConfirmDialog component in frontend/plantform/src/components/common/ConfirmDialog.tsx
- [X] T002 [P] Create useUndoStack hook skeleton in frontend/plantform/src/hooks/useUndoStack.ts
- [X] T003 [P] Create Zod validation schemas for all entities in frontend/plantform/src/lib/validation.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core fixes that MUST be complete before ANY user story can be implemented reliably

**⚠️ CRITICAL**: The 415 error fix is blocking - no lesson creation works without this

- [X] T004 Add JSONParser to LessonViewSet.parser_classes in backend/plantform/views/lesson_views.py to fix 415 error
- [X] T005 [P] Add max_length=200 validation to title field in CourseSerializer at backend/plantform/serializers/course_serializers.py
- [X] T006 [P] Add max_length=1000 validation to description field in CourseSerializer at backend/plantform/serializers/course_serializers.py
- [X] T007 [P] Add max_length=200 validation to title field in ModuleSerializer at backend/plantform/serializers/course_serializers.py
- [X] T008 [P] Add max_length=1000 validation to description field in ModuleSerializer at backend/plantform/serializers/course_serializers.py
- [X] T009 [P] Add max_length=200 validation to title field in LessonSerializer at backend/plantform/serializers/course_serializers.py
- [X] T010 [P] Add max_length=50000 validation to content_markdown field in LessonSerializer at backend/plantform/serializers/course_serializers.py
- [X] T011 [P] Add 10MB file size validation to video_file field in LessonSerializer at backend/plantform/serializers/course_serializers.py
- [ ] T012 Verify 415 fix by testing lesson creation with JSON Content-Type via curl or API client

**Checkpoint**: Backend validation complete, 415 error fixed - user story implementation can now begin

---

## Phase 3: User Story 1 - Create New Course and Initial Module (Priority: P1)

**Goal**: Instructor can create a new course and add modules to organize content structure

**Independent Test**: Login as instructor → Create course with title/description → Add module → Verify module appears in course structure

### Implementation for User Story 1

- [X] T013 [US1] Add frontend validation for course creation form using Zod schema in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T014 [US1] Add frontend validation for module creation form using Zod schema in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T015 [US1] Add character count display for title (200 max) and description (1000 max) fields in course form at frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T016 [US1] Add error message display for validation errors in course/module forms at frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T017 [US1] Add success toast notification after course creation in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T018 [US1] Add success toast notification after module creation in frontend/plantform/src/pages/instructor/CourseBuilder.tsx

**Checkpoint**: User Story 1 complete - instructors can reliably create courses and modules with proper validation

---

## Phase 4: User Story 2 - Create and Manage Lessons Within Module (Priority: P1)

**Goal**: Instructor can add lessons to modules with text content or video files, completing the course→module→lesson hierarchy

**Independent Test**: Select existing module → Create lesson with title and content → Verify lesson appears in module without 415 error

### Implementation for User Story 2

- [X] T019 [US2] Add frontend validation for lesson creation form using Zod schema in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T020 [US2] Add character count display for lesson title (200 max) and content (50,000 max) in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T021 [US2] Add file size validation display (10MB max) for video uploads in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T022 [US2] Update lesson.service.ts to properly handle JSON vs multipart/form-data based on whether video file is included at frontend/plantform/src/services/lesson.service.ts
- [X] T023 [US2] Add error message display for lesson validation errors in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T024 [US2] Add success toast notification after lesson creation in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T025 [US2] Add loading state indicator during lesson save operation in frontend/plantform/src/pages/instructor/CourseBuilder.tsx

**Checkpoint**: User Story 2 complete - instructors can create lessons without 415 errors, with proper content size validation

---

## Phase 5: User Story 3 - Edit and Reorder Content (Priority: P2)

**Goal**: Instructor can modify existing modules and lessons, and reorder them to improve learning flow

**Independent Test**: Edit existing lesson content → Save → Verify changes persist; Drag lesson to new position → Verify order saved

### Implementation for User Story 3

- [X] T026 [US3] Add edit mode toggle for modules in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T027 [US3] Add edit mode toggle for lessons in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T028 [US3] Implement inline editing for module title and description in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T029 [US3] Implement lesson content editing with character count in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T030 [P] [US3] Add optimistic UI update for module reordering in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T031 [P] [US3] Add optimistic UI update for lesson reordering in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T032 [US3] Add rollback on reorder failure with error message in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T033 [US3] Add unsaved changes warning using beforeunload event in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T034 [US3] Add success toast after edit save in frontend/plantform/src/pages/instructor/CourseBuilder.tsx

**Checkpoint**: User Story 3 complete - instructors can edit and reorder content with immediate feedback

---

## Phase 6: User Story 4 - Delete Content with Undo (Priority: P3)

**Goal**: Instructor can delete modules and lessons with confirmation for non-empty modules, and undo deletions within the session

**Independent Test**: Delete lesson → Verify undo button appears → Click undo → Verify lesson restored; Delete module with lessons → Verify warning dialog shows lesson count → Confirm → Verify cascade delete

### Implementation for User Story 4

- [X] T035 [US4] Implement useUndoStack hook with pushUndo, popUndo, executeUndo functions in frontend/plantform/src/hooks/useUndoStack.ts
- [X] T036 [US4] Add delete button for lessons in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T037 [US4] Add delete button for modules in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T038 [US4] Integrate useUndoStack with lesson deletion in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T039 [US4] Integrate useUndoStack with module deletion in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T040 [US4] Add confirmation dialog for module deletion showing lesson count using ConfirmDialog in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T041 [US4] Add undo notification/button that appears after deletion in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T042 [US4] Implement undo action that restores deleted content via API in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T043 [US4] Add session-clear behavior (undo stack clears on page refresh/logout) in frontend/plantform/src/hooks/useUndoStack.ts
- [X] T044 [US4] Add success toast after successful undo in frontend/plantform/src/pages/instructor/CourseBuilder.tsx

**Checkpoint**: User Story 4 complete - instructors can safely delete content with undo capability

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T045 [P] Add loading spinners for all async operations in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T046 [P] Add error boundary for graceful error handling in frontend/plantform/src/pages/instructor/CourseBuilder.tsx
- [X] T047 [P] Update TypeScript types to include new validation constraints in frontend/plantform/src/types/index.ts
- [X] T048 Run full manual test per quickstart.md validation scenarios
- [X] T049 Verify all acceptance scenarios from spec.md pass manually

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority - can run in parallel or sequentially
  - US3 (P2) can start after Foundational, independent of US1/US2
  - US4 (P3) can start after Foundational, independent of US1/US2/US3
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories (leverages same UI patterns as US1)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Uses content from US1/US2 for testing but doesn't require them complete
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Uses undo hook from Setup, independent of other stories

### Within Each User Story

- Frontend validation before API integration
- Core implementation before UI polish
- Story complete before moving to next priority (for MVP delivery)

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational serializer tasks (T005-T011) marked [P] can run in parallel
- US3 tasks T030-T031 (optimistic updates) marked [P] can run in parallel
- Polish tasks T045-T047 marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members after Foundational

---

## Parallel Example: Foundational Phase

```bash
# Launch all serializer validation tasks together:
Task: "Add max_length=200 validation to title field in CourseSerializer"
Task: "Add max_length=1000 validation to description field in CourseSerializer"
Task: "Add max_length=200 validation to title field in ModuleSerializer"
Task: "Add max_length=1000 validation to description field in ModuleSerializer"
Task: "Add max_length=200 validation to title field in LessonSerializer"
Task: "Add max_length=50000 validation to content_markdown field in LessonSerializer"
Task: "Add 10MB file size validation to video_file field in LessonSerializer"
```

---

## Parallel Example: User Story 3

```bash
# Launch optimistic update tasks together:
Task: "Add optimistic UI update for module reordering in CourseBuilder.tsx"
Task: "Add optimistic UI update for lesson reordering in CourseBuilder.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - 415 fix blocks lesson creation)
3. Complete Phase 3: User Story 1 (course + module creation)
4. Complete Phase 4: User Story 2 (lesson creation)
5. **STOP and VALIDATE**: Test full course→module→lesson flow
6. Deploy/demo if ready - this is the core MVP

### Incremental Delivery

1. Complete Setup + Foundational → Backend fixed, validation ready
2. Add User Story 1 + 2 → Test course creation flow → Deploy/Demo (MVP!)
3. Add User Story 3 → Test edit/reorder → Deploy/Demo
4. Add User Story 4 → Test delete/undo → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T012)
2. Once Foundational is done:
   - Developer A: User Story 1 + User Story 2 (core creation flow)
   - Developer B: User Story 3 (editing/reordering)
   - Developer C: User Story 4 (deletion/undo)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- T004 (415 fix) is the most critical task - blocks all lesson operations
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- CourseBuilder.tsx is the main file for frontend changes - avoid merge conflicts by working on different sections
