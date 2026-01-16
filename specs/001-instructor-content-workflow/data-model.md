# Data Model: Instructor Content Management Workflow

**Branch**: `001-instructor-content-workflow` | **Date**: 2026-01-13

## Entity Overview

This feature uses the existing data model with validation enhancements. The core entities are:

```
User (Instructor)
    │
    └── Course (1:N)
            │
            └── Module (1:N, ordered)
                    │
                    └── Lesson (1:N, ordered)
```

---

## Entities

### User

**Purpose**: Represents platform users with role-based access.

**Location**: `backend/plantform/models/user.py` (existing)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | AutoField | PK | Primary key |
| email | EmailField | unique, required | User email address |
| first_name | CharField | max_length=150 | User's first name |
| last_name | CharField | max_length=150 | User's last name |
| role | CharField | choices=['STUDENT', 'INSTRUCTOR'] | User role for permissions |
| password | CharField | - | Hashed password (inherited from AbstractUser) |
| is_active | BooleanField | default=True | Account active status |
| date_joined | DateTimeField | auto_now_add | Registration timestamp |

**Relationships**:
- One User (instructor) → Many Courses

**No changes required for this feature.**

---

### Course

**Purpose**: Represents a complete learning program created by an instructor.

**Location**: `backend/plantform/models/course.py` (existing, needs validation updates)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | AutoField | PK | Primary key |
| title | CharField | **max_length=200**, required | Course title |
| description | TextField | **max_length=1000**, blank=True | Course description |
| instructor | ForeignKey(User) | on_delete=CASCADE, required | Course owner |
| created_at | DateTimeField | auto_now_add | Creation timestamp |

**Relationships**:
- Many Courses → One User (instructor)
- One Course → Many Modules

**Changes Required**:
- Add `max_length=200` constraint to title field
- Add `max_length=1000` constraint to description field
- Update serializer with matching validation

**Validation Rules**:
- Title: 1-200 characters, required, stripped of leading/trailing whitespace
- Description: 0-1000 characters, optional

---

### Module

**Purpose**: Represents a logical grouping of related lessons within a course.

**Location**: `backend/plantform/models/module.py` (existing, needs validation updates)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | AutoField | PK | Primary key |
| title | CharField | **max_length=200**, required | Module title |
| description | TextField | **max_length=1000**, blank=True | Module description |
| order | PositiveIntegerField | default=0 | Display order within course |
| course | ForeignKey(Course) | on_delete=CASCADE, required | Parent course |

**Relationships**:
- Many Modules → One Course
- One Module → Many Lessons

**Changes Required**:
- Add `max_length=200` constraint to title field
- Add `max_length=1000` constraint to description field
- Update serializer with matching validation

**Validation Rules**:
- Title: 1-200 characters, required
- Description: 0-1000 characters, optional
- Order: Non-negative integer, auto-assigned if not provided

**State Transitions**:
- Created → can be edited, reordered, or deleted
- Deleted → cascade deletes all contained lessons

**Ordering**: Modules are sorted by `order` field within their parent course.

---

### Lesson

**Purpose**: Represents an individual unit of learning content within a module.

**Location**: `backend/plantform/models/lesson.py` (existing, needs validation updates)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | AutoField | PK | Primary key |
| title | CharField | **max_length=200**, required | Lesson title |
| content_markdown | TextField | **max_length=50000**, blank=True | Lesson text content |
| video_file | FileField | **max 10MB**, blank=True, null=True | Uploaded video |
| order | PositiveIntegerField | default=0 | Display order within module |
| module | ForeignKey(Module) | on_delete=CASCADE, required | Parent module |

**Relationships**:
- Many Lessons → One Module

**Changes Required**:
- Add `max_length=200` constraint to title field
- Add `max_length=50000` constraint to content_markdown field
- Add file size validation (10MB max) for video_file
- Update serializer with matching validation

**Validation Rules**:
- Title: 1-200 characters, required
- Content Markdown: 0-50,000 characters, optional
- Video File: Optional, max 10MB, accepted formats: mp4, webm, mov
- Either content_markdown or video_file should be provided (not enforced, but expected)

**Ordering**: Lessons are sorted by `order` field within their parent module.

---

## Indexes

Existing indexes are sufficient. Key indexes for performance:

| Table | Index | Purpose |
|-------|-------|---------|
| course | instructor_id | Filter courses by instructor |
| module | course_id | Filter modules by course |
| module | (course_id, order) | Ordered listing within course |
| lesson | module_id | Filter lessons by module |
| lesson | (module_id, order) | Ordered listing within module |

---

## Cascade Deletion Rules

| When Deleted | Cascades To |
|--------------|-------------|
| User (instructor) | All owned Courses → Modules → Lessons |
| Course | All contained Modules → Lessons |
| Module | All contained Lessons |
| Lesson | Nothing (leaf entity) |

---

## Entity Diagram (ASCII)

```
┌─────────────────┐
│      User       │
│─────────────────│
│ id (PK)         │
│ email           │
│ role            │
│ ...             │
└────────┬────────┘
         │ 1:N (instructor → courses)
         ▼
┌─────────────────┐
│     Course      │
│─────────────────│
│ id (PK)         │
│ title (200)     │
│ description     │
│ (1000)          │
│ instructor (FK) │
│ created_at      │
└────────┬────────┘
         │ 1:N (course → modules)
         ▼
┌─────────────────┐
│     Module      │
│─────────────────│
│ id (PK)         │
│ title (200)     │
│ description     │
│ (1000)          │
│ order           │
│ course (FK)     │
└────────┬────────┘
         │ 1:N (module → lessons)
         ▼
┌─────────────────┐
│     Lesson      │
│─────────────────│
│ id (PK)         │
│ title (200)     │
│ content_markdown│
│ (50000)         │
│ video_file      │
│ (10MB max)      │
│ order           │
│ module (FK)     │
└─────────────────┘
```

---

## Migration Notes

Field constraint changes (max_length additions) will require Django migrations:

1. `python manage.py makemigrations` to generate migration
2. `python manage.py migrate` to apply

Note: Adding max_length to TextField does not create database constraints in SQLite, but DRF serializer validation will enforce the limits.
