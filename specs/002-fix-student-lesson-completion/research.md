# Research: Fix Student Lesson Completion Tracking

**Feature**: 002-fix-student-lesson-completion
**Date**: 2026-01-13
**Phase**: 0 - Outline & Research

## Purpose

This document captures technical research and decisions made during planning. It resolves all "NEEDS CLARIFICATION" items from the Technical Context and documents best practices for the bug fix implementation.

## Research Questions & Findings

### 1. Root Cause Analysis: Data Format Mismatch

**Question**: Why does the frontend lose completion status after page refresh?

**Investigation**:
- Backend endpoint: `GET /api/progress/completed-lessons/`
- Backend response structure (from `enrollment_views.py:CompletedLessonsView`):
  ```json
  {
    "message": "Completed lessons retrieved successfully",
    "count": 5,
    "results": [
      { "id": 1, "title": "Lesson 1", "content_markdown": "...", ... },
      { "id": 2, "title": "Lesson 2", "content_markdown": "...", ... }
    ]
  }
  ```
- Frontend parsing (from `progress.service.ts:12`):
  ```typescript
  async getCompletedLessons(): Promise<number[]> {
    const response = await api.get('/progress/completed-lessons/')
    return response.data.completed_lessons || []  // ❌ Field doesn't exist!
  }
  ```

**Root Cause**: Frontend expects `response.data.completed_lessons` (array of IDs) but backend returns `response.data.results` (array of Lesson objects). Since the field doesn't exist, function returns empty array `[]`.

**Decision**: Fix frontend service to extract IDs from `response.data.results`:
```typescript
return response.data.results?.map((lesson: any) => lesson.id) || []
```

**Rationale**:
- Backend API is working correctly (confirmed by manual testing)
- Changing backend would require modifying serializer and potentially breaking other consumers
- Frontend fix is simpler, safer, and aligns with "minimal changes" constraint
- This approach preserves the existing API contract

**Alternatives Considered**:
- **Alt 1: Modify backend to return ID array** - Rejected because it would require changing the serializer, potentially breaking other API consumers, and violates "no backend changes" constraint
- **Alt 2: Use enrollment endpoint instead** - Rejected because it would require fetching all enrollments (heavier payload) and doesn't solve the core parsing issue

---

### 2. Progress Calculation Strategy

**Question**: How should progress be calculated to ensure course-specific accuracy?

**Investigation**:
- Current implementation (from `StudentDashboard.tsx:73`):
  ```typescript
  {getProgress(lastEnrollment.course_details.lessons_count || 0)}% complete
  ```
- `getProgress()` function (from `useProgress.ts`):
  ```typescript
  const getProgress = (totalLessons: number) => {
    if (totalLessons === 0) return 0
    return Math.round((completedLessons.length / totalLessons) * 100)
  }
  ```
- **Problem**: `completedLessons.length` is global across ALL courses, not filtered by current course

**Decision**: Implement course-filtered progress calculation:
```typescript
const getProgress = (courseId: number, totalLessons: number) => {
  const courseCompletedCount = completedLessons.filter(lessonId =>
    // Check if lesson belongs to this course
    courseLessons[courseId]?.includes(lessonId)
  ).length
  if (totalLessons === 0) return 0
  return Math.round((courseCompletedCount / totalLessons) * 100)
}
```

**Rationale**:
- Ensures FR-005 and FR-006 compliance (course-specific progress calculation)
- Prevents cross-course contamination (SC-003)
- Maintains existing performance characteristics (simple array filtering)

**Alternatives Considered**:
- **Alt 1: Fetch per-course completion from backend** - Rejected due to "no backend changes" and would require new API endpoint
- **Alt 2: Store completions by course in frontend** - Rejected as more complex refactor; current approach works with existing data structure

---

### 3. Error Handling Best Practices

**Question**: What's the best practice for handling network failures during optimistic updates?

**Research Finding**: Industry standard for optimistic UI updates with error handling:
1. **Optimistic Update**: Immediately update UI (mark lesson complete)
2. **API Call**: Send request to backend
3. **Error Recovery**: On failure, revert UI and show error message
4. **No Silent Failures**: Always provide user feedback

**Decision**: Implement try-catch with UI reversion:
```typescript
const markComplete = async (lessonId: number) => {
  // Optimistic update
  setCompletedLessons(prev => [...prev, lessonId])

  try {
    await progressService.markLessonComplete(lessonId)
    // Success - already updated optimistically
  } catch (error) {
    // Revert optimistic update
    setCompletedLessons(prev => prev.filter(id => id !== lessonId))
    // Show error to user
    throw error // Let caller handle error message display
  }
}
```

**Rationale**:
- Meets FR-013 requirement (error message + UI reversion)
- Provides transparent user experience (no false positives)
- Standard pattern in React applications (used by React Query, SWR, etc.)
- Leverages existing ToastContext for error display

**Alternatives Considered**:
- **Alt 1: Queue for retry** - Rejected as too complex for bug fix iteration, requires persistent queue
- **Alt 2: Show pending state** - Rejected as it would delay immediate feedback, contradicting SC-006 (500ms update time)
- **Alt 3: Silent failure** - Rejected as it creates false positive user experience

---

### 4. Concurrent Update Handling

**Question**: How to implement last-write-wins semantics without complex conflict resolution?

**Research Finding**: Last-write-wins is the default behavior of RESTful APIs with simple state updates. No special client-side logic required.

**Decision**: No additional frontend logic needed beyond standard API calls.

**Rationale**:
- Backend already implements last-write-wins via Django ORM (ManyToMany add/remove operations)
- HTTP POST/DELETE are not idempotent by nature, but in this context the end state is deterministic
- Frontend doesn't need awareness of other tabs/devices; backend state is source of truth
- Page refresh will always fetch latest state from backend

**Implementation Note**:
- Existing `fetchProgress()` call on component mount already handles synchronization
- No WebSocket or polling required (out of scope per spec constraints)

**Alternatives Considered**:
- **Alt 1: Implement tab synchronization** - Rejected as out of scope, adds complexity
- **Alt 2: Add conflict detection** - Rejected as unnecessary for binary completion state
- **Alt 3: Use optimistic locking** - Rejected as overkill for this use case

---

### 5. Type Safety & Data Contracts

**Question**: How to ensure type safety between frontend and backend data structures?

**Investigation**:
- Backend response not formally documented in TypeScript
- Frontend uses `any` type in some places (anti-pattern)

**Decision**: Define explicit interface for backend response:
```typescript
interface CompletedLessonsResponse {
  message: string
  count: number
  results: Array<{
    id: number
    title: string
    content_markdown: string
    video_file: string | null
    order: number
    module: number
  }>
}
```

**Rationale**:
- Provides compile-time type checking
- Makes data contract explicit
- Prevents future regressions from API changes
- Follows TypeScript best practices (strict mode is enabled)

**Alternatives Considered**:
- **Alt 1: Use OpenAPI/Swagger codegen** - Rejected as backend doesn't have OpenAPI spec, out of scope for bug fix
- **Alt 2: Keep `any` types** - Rejected as reduces type safety and makes bugs harder to catch

---

### 6. Testing Strategy (No Framework Configured)

**Question**: How to verify fixes without automated testing infrastructure?

**Decision**: Manual testing checklist with comprehensive scenarios:
1. Mark lesson complete → Refresh page → Verify still complete
2. Mark lesson complete in multiple courses → Verify independent progress percentages
3. Disconnect network → Mark complete → Verify error message + UI reversion
4. Mark complete in tab A → Refresh tab B → Verify synced state
5. Complete all lessons in course → Verify 100% progress

**Rationale**:
- Setting up test infrastructure (Vitest/Jest) is out of scope for bug fix
- Manual testing is acceptable for small, focused changes
- Documented testing checklist provides reproducibility
- Can be converted to automated tests in future iteration

**Future Recommendation**: Add Vitest for frontend testing in separate task

---

## Technology Decisions

### Frontend State Management

**Decision**: Continue using custom hooks (`useProgress`) with Context API

**Rationale**:
- Existing pattern works for current scale
- No need to introduce Redux/Zustand for bug fix
- Keeps complexity low
- Aligns with "minimal changes" constraint

---

### Error Display Mechanism

**Decision**: Use existing `ToastContext` for error messages

**Rationale**:
- Already implemented in codebase (`frontend/plantform/src/context/ToastContext.tsx`)
- Provides consistent user experience across application
- No need to create new error display mechanism

---

## Performance Considerations

### API Call Optimization

**Current State**:
- `fetchProgress()` called on every component mount
- No caching or request deduplication

**Decision for This Iteration**: No optimization; keep existing behavior

**Rationale**:
- Progress data is small (array of IDs)
- Optimization would add complexity (React Query, SWR)
- Performance goals (2s persistence, 500ms UI updates) are easily met
- Out of scope for bug fix iteration

**Future Recommendation**: Consider React Query for data fetching in future feature work

---

### Progress Calculation Performance

**Current Approach**: Simple array filtering in `getProgress()`

**Decision**: Keep current approach; add course filtering inline

**Rationale**:
- O(n) filtering is fast enough for typical course sizes (10-100 lessons)
- No noticeable performance impact
- Memoization would add complexity without measurable benefit at current scale

---

## Security Considerations

**Authentication**: Existing JWT-based auth is sufficient
**Authorization**: Backend already enforces enrollment check (FR-011)
**Data Validation**: Backend validates lesson IDs and enrollment status

**Decision**: No additional security measures needed for this bug fix

**Rationale**:
- Bug fix doesn't introduce new attack vectors
- Existing security mechanisms adequate
- All writes still go through authenticated backend API

---

## Migration & Deployment

**Database Changes**: None required ✅

**API Changes**: None required ✅

**Frontend Changes**:
- Fix response parsing (backwards compatible - improves broken functionality)
- Add error handling (additive, no breaking changes)
- Update progress calculation (internal logic change, same interface)

**Rollback Plan**: Git revert of frontend changes; no database rollback needed

**Deployment Strategy**: Standard frontend deployment (build + deploy); no backend deployment required

---

## Summary of Decisions

| Decision | Choice | Impact |
|----------|--------|--------|
| Primary Bug Fix | Parse `response.data.results` instead of `.completed_lessons` | Fixes persistence issue (P1) |
| Progress Calculation | Add course ID filtering to existing logic | Fixes cross-course contamination (P2) |
| Error Handling | Try-catch with UI reversion + toast message | Meets FR-013, improves UX |
| Type Safety | Define explicit TypeScript interfaces | Prevents future regressions |
| Testing | Manual testing checklist | Acceptable for focused bug fix |
| Backend Changes | None | Minimal risk, faster deployment |

**Next Phase**: Phase 1 - Design & Contracts (data-model.md, contracts/, quickstart.md)
