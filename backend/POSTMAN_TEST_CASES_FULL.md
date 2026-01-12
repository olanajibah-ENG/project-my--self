# POSTMAN TEST CASES (FULL)

> Base URL: `http://localhost:8000/api/`

## 0) Global Notes

- Always send the **Access Token** (not refresh) in requests:
  - **Header**: `Authorization: Bearer <access_token>`
- If you get `token_not_valid`:
  - login again and copy the `access` token exactly
- For **multipart/form-data** (video upload), do not manually set `Content-Type`; Postman will set boundary automatically.
- All endpoints in this document assume trailing slash `/`.

---

## 1) Auth

### TC-A-01 Register (Student)

**Request**: `POST /auth/register/`

**Headers**:
- `Content-Type: application/json`

**Body (JSON)**:
```json
{
  "username": "student_ahmed",
  "email": "ahmed@student.com",
  "password": "password123",
  "role": "student"
}
```

**Expected (201)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "student_ahmed",
    "email": "ahmed@student.com",
    "role": "student"
  }
}
```

---

### TC-A-02 Register (Instructor)

**Request**: `POST /auth/register/`

**Headers**:
- `Content-Type: application/json`

**Body (JSON)**:
```json
{
  "username": "teacher_mohammed",
  "email": "mohammed@teacher.com",
  "password": "password123",
  "role": "instructor"
}
```

**Expected (201)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 2,
    "username": "teacher_mohammed",
    "email": "mohammed@teacher.com",
    "role": "instructor"
  }
}
```

---

### TC-A-03 Login (Generic)

**Request**: `POST /auth/login/`

**Headers**:
- `Content-Type: application/json`

**Body (JSON)**:
```json
{
  "username": "teacher_mohammed",
  "password": "password123"
}
```

**Expected (200)**:
```json
{
  "refresh": "<refresh>",
  "access": "<access>",
  "username": "teacher_mohammed",
  "role": "instructor",
  "user_id": 2
}
```

---

### TC-A-04 Refresh Token

**Request**: `POST /auth/refresh/`

**Headers**:
- `Content-Type: application/json`

**Body (JSON)**:
```json
{
  "refresh": "<refresh_token>"
}
```

**Expected (200)**:
```json
{
  "access": "<new_access_token>"
}
```

---

## 2) Courses (Instructor vs Student)

### TC-I-01 Create Course (Instructor ONLY)

**Request**: `POST /courses/`

**Headers**:
- `Authorization: Bearer <instructor_access>`
- `Content-Type: application/json`

**Body (JSON)**:
```json
{
  "title": "Django Course",
  "description": "Learn Django from scratch"
}
```

**Expected (201)**:
```json
{
  "id": 1,
  "title": "Django Course",
  "description": "Learn Django from scratch",
  "instructor": "teacher_mohammed",
  "created_at": "<iso_datetime>",
  "modules": []
}
```

---

### TC-S-01 Create Course (Student SHOULD FAIL)

**Request**: `POST /courses/`

**Headers**:
- `Authorization: Bearer <student_access>`
- `Content-Type: application/json`

**Body (JSON)**:
```json
{
  "title": "Student Course",
  "description": "Should fail"
}
```

**Expected (403)**:
```json
{
  "detail": "You do not have permission to perform this action."
}
```

---

### TC-G-01 List Courses (Any authenticated)

**Request**: `GET /courses/`

**Headers**:
- `Authorization: Bearer <access>`

**Expected (200)**: array of courses (each includes modules inline).

---

### TC-I-02 Update Course (Owner)

**Request**: `PUT /courses/<course_id>/`

**Headers**:
- `Authorization: Bearer <instructor_access>`
- `Content-Type: application/json`

**Body (JSON)**:
```json
{
  "title": "Updated Django Course",
  "description": "Updated description"
}
```

**Expected (200)**: updated course object.

---

### TC-I-03 Delete Course (Owner)

**Request**: `DELETE /courses/<course_id>/`

**Headers**:
- `Authorization: Bearer <instructor_access>`

**Expected (200)**:
```json
{
  "message": "Course deleted successfully"
}
```

---

## 3) Enrollment (Student)

### TC-S-02 Enroll in Course

**Request**: `POST /courses/<course_id>/enroll/`

**Headers**:
- `Authorization: Bearer <student_access>`

**Expected (200)**:
```json
{
  "message": "Enrolled successfully",
  "enrollment": {
    "id": 1,
    "student": 1,
    "course": 1,
    "enrolled_at": "<iso_datetime>"
  },
  "course": {
    "id": 1,
    "title": "Django Course",
    "description": "Learn Django from scratch",
    "instructor": "teacher_mohammed",
    "created_at": "<iso_datetime>",
    "modules": []
  }
}
```

---

## 4) Modules

### TC-I-04 Create Module (Instructor ONLY)

**Request**: `POST /modules/`

**Headers**:
- `Authorization: Bearer <instructor_access>`
- `Content-Type: application/json`

**Body (JSON)**:
```json
{
  "title": "Introduction",
  "description": "Basics",
  "order": 1,
  "course": 1
}
```

**Expected (201)**:
```json
{
  "id": 1,
  "title": "Introduction",
  "description": "Basics",
  "order": 1,
  "course": 1,
  "lessons": []
}
```

---

### TC-S-03 List Modules (Student sees ONLY enrolled)

**Request**: `GET /modules/`

**Headers**:
- `Authorization: Bearer <student_access>`

**Expected (200)**:
```json
{
  "message": "Modules retrieved successfully",
  "count": 1,
  "results": [
    {
      "id": 1,
      "title": "Introduction",
      "description": "Basics",
      "order": 1,
      "course": 1,
      "lessons": []
    }
  ]
}
```

---

### TC-I-05 Update Module (Instructor)

**Request**: `PUT /modules/<module_id>/`

**Headers**:
- `Authorization: Bearer <instructor_access>`
- `Content-Type: application/json`

**Body (JSON)**:
```json
{
  "title": "Introduction Updated",
  "description": "Basics Updated",
  "order": 1,
  "course": 1
}
```

**Expected (200)**: updated module.

---

### TC-I-06 Delete Module (Instructor)

**Request**: `DELETE /modules/<module_id>/`

**Headers**:
- `Authorization: Bearer <instructor_access>`

**Expected (200)**:
```json
{
  "message": "Module deleted successfully"
}
```

---

## 5) Lessons (Markdown + Video)

### TC-I-07 Create Lesson with Markdown + Video (Instructor ONLY)

**Request**: `POST /lessons/`

**Headers**:
- `Authorization: Bearer <instructor_access>`

**Body**: `multipart/form-data`

FormData:
- `title`: `Python Basics`
- `content_markdown`: `## Welcome\nThis is **Markdown**`
- `order`: `1`
- `module`: `1`
- `video_file`: *(attach MP4)*

**Expected (201)**:
```json
{
  "id": 1,
  "title": "Python Basics",
  "content_markdown": "## Welcome\nThis is **Markdown**",
  "video_file": "/media/lesson_videos/<file>.mp4",
  "order": 1,
  "module": 1
}
```

---

### TC-S-04 List Lessons (Student sees ONLY enrolled)

**Request**: `GET /lessons/`

**Headers**:
- `Authorization: Bearer <student_access>`

**Expected (200)**:
```json
{
  "message": "Lessons retrieved successfully",
  "count": 1,
  "results": [
    {
      "id": 1,
      "title": "Python Basics",
      "content_markdown": "## Welcome\nThis is **Markdown**",
      "video_file": "/media/lesson_videos/<file>.mp4",
      "order": 1,
      "module": 1
    }
  ]
}
```

---

### TC-G-02 Get Lesson Markdown Only

**Request**: `GET /lessons/<lesson_id>/markdown/`

**Headers**:
- `Authorization: Bearer <access>`

**Expected (200)**:
```json
{
  "content_markdown": "## Welcome\nThis is **Markdown**"
}
```

---

### TC-G-03 Get Lesson Video URL Only

**Request**: `GET /lessons/<lesson_id>/video/`

**Headers**:
- `Authorization: Bearer <access>`

**Expected (200)**:
```json
{
  "video_file": "/media/lesson_videos/intro.mp4"
}
```

---

### TC-I-08 Update Lesson (Instructor ONLY)

**Request**: `PUT /lessons/<lesson_id>/`

**Headers**:
- `Authorization: Bearer <instructor_access>`
- `Content-Type: application/json`

**Body (JSON)**:
```json
{
  "title": "Updated Python Basics",
  "content_markdown": "## Updated Welcome\nThis is **Updated Markdown**",
  "order": 1,
  "module": 1
}
```

**Expected (200)**:
```json
{
  "id": 1,
  "title": "Updated Python Basics",
  "content_markdown": "## Updated Welcome\nThis is **Updated Markdown**",
  "video_file": "/media/lesson_videos/<file>.mp4",
  "order": 1,
  "module": 1
}
```

---

### TC-I-09 Delete Lesson (Instructor)

**Request**: `DELETE /lessons/<lesson_id>/`

**Headers**:
- `Authorization: Bearer <instructor_access>`

**Expected (200)**:
```json
{
  "message": "Lesson deleted successfully"
}
```

---

## 6) Progress (Student)

### TC-S-11 Mark Lesson Completed

**Request**: `POST /lessons/<lesson_id>/complete/`

**Headers**:
- `Authorization: Bearer <student_access>`

**Expected (200)**:
```json
{
  "message": "Lesson marked as completed",
  "lesson_id": 1
}
```

**Expected Error (403) if not enrolled**:
```json
{
  "detail": "Not enrolled"
}
```

---

### TC-S-12 Get Completed Lessons

**Request**: `GET /progress/completed-lessons/`

**Headers**:
- `Authorization: Bearer <student_access>`

**Expected (200)**:
```json
{
  "message": "Completed lessons retrieved successfully",
  "count": 1,
  "results": [
    {
      "id": 1,
      "title": "Python Basics",
      "content_markdown": "## Welcome\nThis is **Markdown**",
      "video_file": "/media/lesson_videos/<file>.mp4",
      "order": 1,
      "module": 1
    }
  ]
}
```

---

## 7) Common Error Cases

### TC-E-01 No Token

**Request**: `GET /courses/`

**Expected (401)**:
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

### TC-E-02 Wrong Credentials

**Request**: `POST /auth/login/`

**Body**:
```json
{
  "username": "wrong",
  "password": "wrong"
}
```

**Expected (401)**:
```json
{
  "detail": "No active account found with the given credentials"
}
```

---

### TC-E-03 Invalid Token

**Expected (401)**:
```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid"
}
```

---

## 8) Recommended End-to-End Flow

1) Register instructor
2) Login instructor → save `instructor_access`
3) Create course
4) Create modules (ordered)
5) Create lessons (ordered) + markdown + video
6) Register student
7) Login student → save `student_access`
8) Enroll student in the course
9) Student list modules/lessons
10) Student get markdown/video endpoints
11) Student mark lesson complete
12) Student list completed lessons
