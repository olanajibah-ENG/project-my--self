# OlaLearn Rebrand & Redesign

## Overview

Comprehensive rebrand of the PlantForm educational platform to **OlaLearn** — a professional, polished learning management system for individual educators and students.

**Key Goals:**
- Rebrand from PlantForm to OlaLearn
- Complete frontend redesign with professional, enterprise-quality UX
- Maintain free platform model
- Fix backend issues as encountered
- English-first with Arabic support

---

## Brand Identity

### Name & Logo
- **Name**: OlaLearn (single word)
- **Logomark**: Simple geometric mark — abstract "O" suggesting openness/learning
- **Wordmark**: Clean sans-serif, slightly rounded for approachability

### Color Palette
- **Primary**: Soft teal (`#0D9488`) — CTAs, links, key accents
- **Neutral base**: Warm grays and off-whites (`#F9FAFB`, `#6B7280`, `#111827`)
- **Semantic**: Muted success/error/warning colors
- **Future**: Dark mode planned (avoid pure white/black)

### Typography
- **Font**: Inter — clean, professional, excellent EN/AR readability
- **Headings**: Semi-bold, generous sizing
- **Body**: Regular weight, comfortable line-height

### Visual Language
- Rounded corners (8-12px)
- Subtle shadows for depth
- Generous whitespace
- No emojis — functional icons only (Lucide/Phosphor)
- Custom OlaLearn logomark for brand identity

---

## Information Architecture

### Public Pages
- `/` — Landing page with value proposition
- `/login` — Login form
- `/register` — Registration with role selection
- `/courses` — Public course catalog

### Student Routes
- `/dashboard` — Enrolled courses, continue learning, progress
- `/courses/:id` — Course detail, curriculum preview, enroll
- `/courses/:id/learn` — Focused learning view
- `/my-courses` — All enrolled courses

### Instructor Routes
- `/dashboard` — Courses overview, stats
- `/courses/new` — Create course
- `/courses/:id/edit` — Course builder (two-panel editor)
- `/my-courses` — All created courses

### Shared
- `/settings` — Account settings, language
- Persistent header: logo, nav, language toggle, user menu

---

## Student Experience

### Dashboard
- "Continue Learning" hero — resume last lesson
- Enrolled courses grid with progress bars
- Empty state prompting course discovery

### Course Catalog
- Clean course card grid
- Search/filter by title
- Cards show: title, instructor, lesson count, description

### Course Detail
- Course title, instructor, total lessons
- Description and learning outcomes
- Expandable curriculum outline
- Clear Enroll / Continue Learning CTA

### Learning View (Core Experience)
- **Three-column layout** (desktop):
  - Left: collapsible module/lesson navigation with completion checkmarks
  - Center: video player or markdown reader
  - Right: optional notes (hidden by default)
- **Video player**: Minimal controls, speed selector, fullscreen
- **Markdown reader**: Clean typography, syntax highlighting
- **Navigation**: Previous/Next buttons, Mark Complete
- **Progress**: "Module X • Lesson Y of Z" indicator
- **Mobile**: Sidebar as slide-out drawer

---

## Instructor Experience

### Dashboard
- Quick stats: courses, students, lessons
- Course grid with student counts
- Prominent "Create New Course" CTA
- Welcoming empty state for new instructors

### Course Builder (Power Tool)
- **Two-panel layout**:
  - Left: Course structure
    - Inline-editable course title
    - Collapsible modules with nested lessons
    - Drag-and-drop reordering
    - Add Module / Add Lesson buttons
  - Right: Editor panel
    - Lesson title field
    - Content type: Markdown / Video / Both
    - Markdown editor with preview
    - Video upload with progress
    - Save indicator

### UX Principles
- No page reloads — fluid SPA experience
- Clear save states
- Confirmation for destructive actions
- Drag-drop reordering

---

## Authentication

### Login (`/login`)
- Centered card layout
- Email/Username + Password fields
- Log in button (primary teal)
- Register link

### Register (`/register`)
- Same card style
- Fields: Name, Email, Username, Password, Confirm
- **Role selection**: Radio cards for "I want to learn" / "I want to teach"
- Create account button

### Post-Registration
- **Student**: Redirect to `/courses` with welcome toast
- **Instructor**: Redirect to `/dashboard` with "Create first course" prompt

### Session Management
- JWT (access + refresh tokens)
- Silent refresh via interceptor
- Auth failure → redirect to login with toast
- Inline validation errors

---

## Technical Architecture

### Frontend Structure
```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Header, Sidebar, PageContainer
│   ├── course/          # CourseCard, CourseList, CourseBuilder
│   ├── lesson/          # LessonEditor, LessonViewer, VideoPlayer
│   └── common/          # LoadingSpinner, EmptyState, ConfirmDialog
├── pages/
│   ├── auth/            # LoginPage, RegisterPage
│   ├── student/         # Dashboard, CourseCatalog, LearningView
│   └── instructor/      # Dashboard, CourseBuilder
├── services/            # API calls
├── hooks/               # useAuth, useCourse, useProgress
├── context/             # AuthContext, LanguageContext
├── lib/                 # Utils, api client
├── types/               # TypeScript interfaces
└── styles/              # Tailwind config
```

### Tech Stack
- React 19 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- React Router (protected routes)
- React Context (auth, language)
- Axios with interceptors
- React Hook Form + Zod

### Backend Approach
- Fix issues as encountered
- Consistent response format: `{ data, message, success }`
- Add missing serializer fields as needed
- Fix auth/permission gaps
- Ensure cascade deletes

---

## Implementation Phases

### Phase 1: Foundation
- Tailwind CSS + shadcn/ui setup
- Brand theme (colors, typography)
- Core layout components
- Routing with auth guards

### Phase 2: Authentication
- Rebuild Login/Register pages
- Clean up auth service
- End-to-end auth testing

### Phase 3: Student Experience
- Student dashboard
- Course catalog
- Course detail page
- Learning view
- Progress tracking

### Phase 4: Instructor Experience
- Instructor dashboard
- Course builder
- Module/lesson CRUD
- Content editing

### Phase 5: Polish
- Empty states
- Loading states
- Error handling
- Responsive design
- RTL/Arabic refinement
- Code cleanup

---

## What Gets Removed

- All current component files (complete rewrite)
- Sound effect code
- Emoji-based UI elements
- Old CSS files
- Celebration animations
- Unused translations/assets

---

## Design Principles

1. **Professional & Structured** — Coursera/LinkedIn Learning baseline
2. **Personal Touch** — Signature teal, soft geometry, thoughtful details
3. **YAGNI** — No features beyond core experience for now
4. **Minimal Depth** — Content reachable in 2-3 clicks
5. **No Gimmicks** — No sounds, no childish animations
6. **Accessibility** — Proper contrast, keyboard nav, semantic HTML
