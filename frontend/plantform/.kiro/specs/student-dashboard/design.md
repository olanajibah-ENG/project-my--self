# Design Document - Student Dashboard

## Overview

Student Dashboard هو نظام شامل لإدارة تجربة التعلم للطلاب، مصمم بواجهة عربية جميلة ومتجاوبة. يوفر النظام أربعة أقسام رئيسية: التسجيل في الكورسات، عرض المحتوى، تتبع التقدم، والدروس المكتملة. التصميم يركز على تجربة المستخدم المتميزة مع الحركات السلسة والألوان الجذابة.

## Architecture

### Component Hierarchy
```
StudentDashboard (Main Container)
├── StudentSidebar (Navigation)
│   ├── Logo & Header
│   ├── Navigation Items
│   └── User Info Footer
└── MainContent (Dynamic Content)
    ├── EnrollCourse (Tab 1)
    ├── ViewContent (Tab 2)
    ├── SelectCompleted (Tab 3)
    └── CompletedLessons (Tab 4)
```

### State Management
- **Local State**: Tab navigation, loading states, UI interactions
- **API State**: Course data, lesson data, enrollment status, progress tracking
- **Authentication State**: Token management, user session

### Routing Strategy
- Single Page Application with tab-based navigation
- No URL routing - state-based content switching
- Persistent sidebar navigation across all tabs

## Components and Interfaces

### 1. StudentDashboard (Main Container)

**Purpose**: Main orchestrator component managing navigation and content display

**Props Interface**:
```typescript
interface StudentDashboardProps {
  // No external props - self-contained component
}
```

**State Interface**:
```typescript
interface StudentDashboardState {
  activeTab: 'enroll' | 'view' | 'select' | 'completed';
}
```

**Key Features**:
- Tab-based navigation system
- Automatic token refresh on component mount
- Sound effects for interactions
- Responsive layout management

### 2. EnrollCourse Component

**Purpose**: Handle course enrollment with beautiful card-based UI

**Props Interface**:
```typescript
interface EnrollCourseProps {
  onEnrollSuccess: () => void;
}
```

**State Interface**:
```typescript
interface EnrollCourseState {
  courses: Course[];
  isLoading: boolean;
  enrollingId: number | null;
}
```

**Key Features**:
- Grid layout for course cards
- Animated loading states
- Success/error feedback with sounds
- Watermark and gradient effects

### 3. ViewContent Component

**Purpose**: Multi-mode content viewer with tabs for different content types

**State Interface**:
```typescript
interface ViewContentState {
  viewMode: 'modules' | 'lessons' | 'markdown' | 'videos';
  modules: Module[];
  lessons: Lesson[];
  isLoading: boolean;
  selectedLesson: Lesson | null;
  isMarkdownOpen: boolean;
  isVideoOpen: boolean;
}
```

**Key Features**:
- Four viewing modes with smooth transitions
- Modal integration for markdown and video content
- Filtering for video-enabled lessons
- Responsive grid layouts

### 4. SelectCompleted Component

**Purpose**: Allow students to mark lessons as completed

**State Interface**:
```typescript
interface SelectCompletedState {
  lessons: Lesson[];
  isLoading: boolean;
  completingId: number | null;
}
```

**Key Features**:
- Lesson completion tracking
- Visual feedback for completion actions
- Order-based lesson display
- Success confirmations with animations

### 5. CompletedLessons Component

**Purpose**: Display completed lessons with celebration UI

**State Interface**:
```typescript
interface CompletedLessonsState {
  lessons: Lesson[];
  isLoading: boolean;
  count: number;
}
```

**Key Features**:
- Completion statistics display
- Celebration animations and emojis
- Empty state with encouraging message
- Achievement-style visual design

## Data Models

### Course Model
```typescript
interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  modules: Module[];
}
```

### Module Model
```typescript
interface Module {
  id: number;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}
```

### Lesson Model
```typescript
interface Lesson {
  id: number;
  title: string;
  order: number;
  video_file?: string;
}
```

### Student Service Models
```typescript
interface EnrollmentResponse {
  message: string;
  enrollment: Enrollment;
  course: Course;
}

interface CompletedLessonsResponse {
  message: string;
  count: number;
  results: Lesson[];
}
```

## Visual Design System

### Color Palette
- **Primary Green**: `#10b981` to `#34d399` (Enrollment theme)
- **Primary Blue**: `#3b82f6` to `#60a5fa` (Content viewing theme)
- **Primary Purple**: `#8b5cf6` to `#a78bfa` (Completion theme)
- **Primary Amber**: `#f59e0b` to `#fbbf24` (Progress theme)
- **Background**: `#f0fdf4` to `#bbf7d0` (Light green gradient)
- **Cards**: White with colored shadows
- **Text**: `#1f2937` (primary), `#6b7280` (secondary), `#9ca3af` (muted)

### Typography
- **Headers**: 32px, weight 800, gradient text
- **Titles**: 18-24px, weight 700
- **Body**: 14-16px, weight 400-600
- **Meta**: 12-13px, weight 500

### Animation System
- **Entry Animations**: `fadeInUp` with staggered delays (0.1s increments)
- **Hover Effects**: `translateY(-6px)` with enhanced shadows
- **Loading States**: Rotating spinners and pulse effects
- **Success Actions**: Bounce and pulse animations
- **Floating Elements**: Continuous float animation (6s cycle)
- **Interactive Feedback**: Scale and shadow transitions

### Layout Principles
- **Grid Systems**: `repeat(auto-fill, minmax(280px, 1fr))`
- **Spacing**: 16px, 20px, 24px increments
- **Border Radius**: 12px, 16px, 20px for different elements
- **Shadows**: Layered shadows with theme colors
- **Responsive Breakpoints**: 768px (tablet), 480px (mobile)

## Error Handling

### API Error Management
```typescript
interface ErrorHandling {
  networkErrors: 'Display retry options with user-friendly messages';
  authenticationErrors: 'Redirect to login or refresh tokens';
  validationErrors: 'Show field-specific error messages';
  serverErrors: 'Display generic error with support contact';
}
```

### User Feedback Strategy
- **Success States**: Green checkmarks, success sounds, confirmation messages
- **Error States**: Red indicators, clear error descriptions, retry buttons
- **Loading States**: Spinners, skeleton screens, progress indicators
- **Empty States**: Encouraging messages with call-to-action buttons

## Testing Strategy

### Unit Testing Approach
- **Component Rendering**: Test all components render without errors
- **User Interactions**: Test button clicks, form submissions, navigation
- **State Management**: Test state updates and side effects
- **API Integration**: Mock API calls and test response handling
- **Error Scenarios**: Test error boundaries and fallback UI

### Property-Based Testing
Property-based tests will validate universal behaviors across the system using generated test data to ensure robustness.

**Testing Framework**: Jest with React Testing Library
**Property Testing Library**: fast-check for TypeScript
**Test Configuration**: Minimum 100 iterations per property test