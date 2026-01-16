# Research: Instructor Content Management Workflow

**Branch**: `001-instructor-content-workflow` | **Date**: 2026-01-13

## Research Summary

This document consolidates research findings for all technical decisions and unknowns identified during implementation planning.

---

## 1. HTTP 415 Error Resolution

### Decision
Add `JSONParser` to `LessonViewSet.parser_classes` alongside existing `MultiPartParser` and `FormParser`.

### Rationale
The 415 "Unsupported Media Type" error occurs because:
- Frontend sends `Content-Type: application/json` for non-file lesson creation
- Backend `LessonViewSet` only has `MultiPartParser` and `FormParser` configured
- DRF rejects requests with unsupported Content-Type headers

The fix is to add `JSONParser` to handle JSON requests for lesson creation without files:

```python
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser

class LessonViewSet(viewsets.ModelViewSet):
    parser_classes = [JSONParser, MultiPartParser, FormParser]
```

### Alternatives Considered
1. **Change frontend to always use FormData**: Rejected - adds unnecessary complexity and doesn't follow REST conventions for non-file payloads
2. **Remove parser_classes entirely (use DRF defaults)**: Rejected - would lose explicit control over accepted content types
3. **Create separate endpoints for JSON vs file uploads**: Rejected - over-engineering for the use case

---

## 2. Session-Based Undo Implementation

### Decision
Implement client-side undo stack using React state management with a custom `useUndoStack` hook.

### Rationale
Requirements specify:
- Undo available until page refresh or logout
- No persistence required after session ends
- Simple restore functionality for deleted items

A React state-based approach is ideal because:
- No backend changes needed
- State naturally clears on page refresh
- Simple implementation with useState/useReducer
- Aligns with session-scoped requirement

### Implementation Pattern

```typescript
interface UndoableAction {
  id: string;
  type: 'delete_lesson' | 'delete_module';
  timestamp: number;
  data: Lesson | Module;
  parentId: number; // moduleId for lessons, courseId for modules
}

function useUndoStack() {
  const [undoStack, setUndoStack] = useState<UndoableAction[]>([]);

  const pushUndo = (action: UndoableAction) => {
    setUndoStack(prev => [...prev, action]);
  };

  const popUndo = (): UndoableAction | undefined => {
    const action = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    return action;
  };

  const executeUndo = async () => {
    const action = popUndo();
    if (!action) return;

    if (action.type === 'delete_lesson') {
      await lessonService.createLesson(action.parentId, action.data);
    } else if (action.type === 'delete_module') {
      await moduleService.createModule(action.parentId, action.data);
    }
  };

  return { undoStack, pushUndo, executeUndo, hasUndo: undoStack.length > 0 };
}
```

### Alternatives Considered
1. **LocalStorage persistence**: Rejected - spec explicitly states session-based only
2. **Backend soft-delete with undelete endpoint**: Rejected - over-engineering, adds complexity
3. **Redux/Zustand state management**: Rejected - existing app uses local React state patterns

---

## 3. Cascade Deletion with Confirmation

### Decision
Implement two-phase deletion: frontend confirmation dialog followed by backend cascade delete.

### Rationale
Requirements specify:
- Warning dialog showing count of contained lessons
- Explicit confirmation required
- All contained lessons deleted with module

### Implementation Pattern

**Frontend (React)**:
```typescript
const handleDeleteModule = async (moduleId: number) => {
  const module = modules.find(m => m.id === moduleId);
  const lessonCount = module?.lessons?.length || 0;

  if (lessonCount > 0) {
    const confirmed = await showConfirmDialog({
      title: 'Delete Module?',
      message: `This module contains ${lessonCount} lesson(s). Deleting it will remove all lessons permanently.`,
      confirmText: 'Delete Module and Lessons',
      cancelText: 'Cancel'
    });
    if (!confirmed) return;
  }

  // Store for undo before deletion
  pushUndo({
    id: crypto.randomUUID(),
    type: 'delete_module',
    timestamp: Date.now(),
    data: module,
    parentId: module.course
  });

  await moduleService.deleteModule(moduleId);
};
```

**Backend (Django)**:
Django's default behavior with `on_delete=models.CASCADE` already handles this:
```python
class Lesson(models.Model):
    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,  # Already configured
        related_name='lessons'
    )
```

### Alternatives Considered
1. **Soft delete with is_deleted flag**: Rejected - adds complexity, not needed for MVP
2. **Block deletion if module has lessons**: Rejected - spec explicitly allows deletion with confirmation
3. **Orphan lessons (set module to null)**: Rejected - violates referential integrity requirement

---

## 4. Field Validation Strategy

### Decision
Implement validation at both frontend (for immediate feedback) and backend (for data integrity).

### Rationale
Dual-layer validation provides:
- Fast user feedback (frontend)
- Security and data integrity (backend)
- Consistent error messages

### Field Constraints (from spec clarifications)

| Entity | Field | Required | Max Length |
|--------|-------|----------|------------|
| Course | title | Yes | 200 chars |
| Course | description | No | 1000 chars |
| Module | title | Yes | 200 chars |
| Module | description | No | 1000 chars |
| Lesson | title | Yes | 200 chars |
| Lesson | content_markdown | No | 50,000 chars |
| Lesson | video_file | No | 10MB |

### Implementation Pattern

**Backend (DRF Serializers)**:
```python
from rest_framework import serializers

class LessonSerializer(serializers.ModelSerializer):
    title = serializers.CharField(max_length=200, required=True)
    content_markdown = serializers.CharField(max_length=50000, required=False, allow_blank=True)

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content_markdown', 'video_file', 'order', 'module']

    def validate_video_file(self, value):
        if value and value.size > 10 * 1024 * 1024:  # 10MB
            raise serializers.ValidationError("Video file must be less than 10MB")
        return value
```

**Frontend (Zod + React Hook Form)**:
```typescript
import { z } from 'zod';

const lessonSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  content_markdown: z.string().max(50000, 'Content must be 50,000 characters or less').optional(),
});
```

### Alternatives Considered
1. **Frontend-only validation**: Rejected - security risk, data integrity not guaranteed
2. **Backend-only validation**: Rejected - poor UX, delayed error feedback
3. **Database constraints only**: Rejected - error messages not user-friendly

---

## 5. Reordering Implementation

### Decision
Use existing DRF `reorder` action pattern with optimistic UI updates.

### Rationale
- Backend already has `reorder` actions on ModuleViewSet and LessonViewSet
- Optimistic updates provide responsive feel
- Rollback on failure maintains consistency

### Implementation Pattern

**Backend (already exists in views)**:
```python
@action(detail=False, methods=['post'])
def reorder(self, request):
    # Expects: {"orders": [{"id": 1, "order": 0}, {"id": 2, "order": 1}]}
    orders = request.data.get('orders', [])
    for item in orders:
        Lesson.objects.filter(id=item['id']).update(order=item['order'])
    return Response({'status': 'reordered'})
```

**Frontend (optimistic update)**:
```typescript
const handleReorder = async (lessonId: number, newOrder: number) => {
  // Optimistic update
  const previousLessons = [...lessons];
  setLessons(reorderArray(lessons, lessonId, newOrder));

  try {
    await lessonService.reorder(moduleId, getOrdersPayload(lessons));
  } catch (error) {
    // Rollback on failure
    setLessons(previousLessons);
    showError('Failed to reorder lessons');
  }
};
```

---

## 6. Testing Framework Setup

### Decision
- Backend: pytest with pytest-django
- Frontend: Vitest with React Testing Library

### Rationale
- pytest is Django community standard
- Vitest integrates natively with Vite build tool
- Both support modern async patterns

### Configuration Files Needed

**Backend (pytest.ini)**:
```ini
[pytest]
DJANGO_SETTINGS_MODULE = edupro.settings
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

**Frontend (vitest.config.ts)**:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

---

## Dependencies to Add

### Backend (requirements.txt additions)
```
pytest>=8.0.0
pytest-django>=4.8.0
pytest-cov>=4.1.0
```

### Frontend (package.json devDependencies additions)
```json
{
  "vitest": "^2.0.0",
  "@testing-library/react": "^16.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "jsdom": "^25.0.0"
}
```

---

## Research Complete

All NEEDS CLARIFICATION items have been resolved:
- ✓ 415 error fix strategy determined
- ✓ Session-based undo pattern defined
- ✓ Cascade deletion approach confirmed
- ✓ Field validation strategy documented
- ✓ Reordering implementation confirmed
- ✓ Testing framework setup defined

Ready to proceed to Phase 1: Design & Contracts.
