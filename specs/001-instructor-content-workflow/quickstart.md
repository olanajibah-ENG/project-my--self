# Quickstart: Instructor Content Management Workflow

**Branch**: `001-instructor-content-workflow` | **Date**: 2026-01-13

## Prerequisites

- Python 3.13+
- Node.js 18+
- Git

## Setup

### 1. Clone and checkout branch

```bash
git checkout 001-instructor-content-workflow
```

### 2. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional, for admin access)
python manage.py createsuperuser

# Start development server
python manage.py runserver 8001
```

Backend will be available at: `http://localhost:8001`

### 3. Frontend setup

```bash
cd frontend/plantform

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## Quick Verification

### Test the 415 fix

After implementing the fix, verify with:

```bash
# Login to get a token
curl -X POST http://localhost:8001/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "instructor@test.com", "password": "testpass123"}'

# Create a lesson with JSON (should work after fix)
curl -X POST http://localhost:8001/api/lessons/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{"title": "Test Lesson", "content_markdown": "# Hello", "module": 1}'
```

**Before fix**: Returns 415 Unsupported Media Type
**After fix**: Returns 201 Created

### Test validation limits

```bash
# Title too long (should fail with 400)
curl -X POST http://localhost:8001/api/courses/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{"title": "'"$(python -c 'print("x"*201)')"'"}'

# Expected: 400 with {"title": ["Ensure this field has no more than 200 characters."]}
```

## Key Files to Modify

### Backend

| File | Purpose |
|------|---------|
| `backend/plantform/views/lesson_views.py` | Add JSONParser to fix 415 |
| `backend/plantform/serializers/course_serializers.py` | Add max_length validation |
| `backend/plantform/serializers/module_serializers.py` | Add max_length validation |
| `backend/plantform/serializers/lesson_serializers.py` | Add max_length + file size validation |

### Frontend

| File | Purpose |
|------|---------|
| `frontend/plantform/src/hooks/useUndoStack.ts` | New - session undo logic |
| `frontend/plantform/src/pages/instructor/CourseBuilder.tsx` | Add undo UI, delete confirmation |
| `frontend/plantform/src/services/lesson.service.ts` | Review Content-Type handling |
| `frontend/plantform/src/components/common/ConfirmDialog.tsx` | Reusable confirmation dialog |

## Running Tests

### Backend (after pytest setup)

```bash
cd backend
pytest -v
pytest --cov=plantform --cov-report=html  # With coverage
```

### Frontend (after vitest setup)

```bash
cd frontend/plantform
npm test
npm run test:coverage  # With coverage
```

## API Documentation

OpenAPI spec available at: `specs/001-instructor-content-workflow/contracts/openapi.yaml`

View with Swagger UI:
```bash
npx swagger-ui-watcher contracts/openapi.yaml
```

## Development Workflow

1. **Start both servers** (backend on 8001, frontend on 5173)
2. **Login as instructor** via frontend or API
3. **Create course** → **Add module** → **Add lesson**
4. **Verify** no 415 errors occur during lesson creation
5. **Test validation** by exceeding character limits
6. **Test deletion** with undo functionality

## Troubleshooting

### 415 Error still occurring

Check that `lesson_views.py` includes JSONParser:
```python
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser

class LessonViewSet(viewsets.ModelViewSet):
    parser_classes = [JSONParser, MultiPartParser, FormParser]
```

### CORS errors

Ensure `django-cors-headers` is configured in `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

### Token expired

Refresh token via:
```bash
curl -X POST http://localhost:8001/api/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "<your_refresh_token>"}'
```
