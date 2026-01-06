# حالات اختبار Postman - Gallery API

## معلومات عامة
- **Base URL**: `http://localhost:8000`
- **API Prefix**: `/api/`

---

## 1. إنشاء ألبوم جديد (Create Album)

### Request
- **Method**: `POST`
- **URL**: `http://localhost:8000/api/albums/`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "title": "عطلة صيفية 2024"
  }
  ```

### حالات الاختبار:

#### ✅ حالة 1: إنشاء ألبوم بنجاح
- **Title**: "عطلة صيفية 2024"
- **Expected Status**: `201 Created`
- **Expected Response**:
  ```json
  {
    "id": 1,
    "title": "عطلة صيفية 2024",
    "photos": [],
    "created_at": "2024-01-15T10:30:00Z"
  }
  ```

#### ✅ حالة 2: إنشاء ألبوم بعنوان إنجليزي
- **Title**: "Summer Vacation 2024"
- **Expected Status**: `201 Created`

#### ❌ حالة 3: إنشاء ألبوم بدون عنوان (خطأ)
- **Body**: `{}` أو `{"title": ""}`
- **Expected Status**: `400 Bad Request`
- **Expected Response**:
  ```json
  {
    "error": "Title is required"
  }
  ```

#### ✅ حالة 4: إنشاء ألبوم بعنوان طويل
- **Title**: "رحلتي إلى باريس في الصيف مع العائلة والأصدقاء"
- **Expected Status**: `201 Created` (إذا كان أقل من 255 حرف)

---

## 2. الحصول على جميع الألبومات (Get All Albums)

### Request
- **Method**: `GET`
- **URL**: `http://localhost:8000/api/albums/`
- **Headers**: لا حاجة

### حالات الاختبار:

#### ✅ حالة 1: الحصول على قائمة فارغة
- **Expected Status**: `200 OK`
- **Expected Response**:
  ```json
  []
  ```

#### ✅ حالة 2: الحصول على قائمة بألبومات
- **Prerequisites**: قم بإنشاء ألبوم واحد على الأقل أولاً
- **Expected Status**: `200 OK`
- **Expected Response**:
  ```json
  [
    {
      "id": 1,
      "title": "عطلة صيفية 2024",
      "photos": [],
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "title": "حفلة عيد ميلاد",
      "photos": [],
      "created_at": "2024-01-16T11:00:00Z"
    }
  ]
  ```

#### ✅ حالة 3: الحصول على ألبومات مع صور
- **Prerequisites**: قم بإنشاء ألبوم ورفع صور له
- **Expected Status**: `200 OK`
- **Expected Response**:
  ```json
  [
    {
      "id": 1,
      "title": "عطلة صيفية 2024",
      "photos": [
        {
          "id": 1,
          "album": 1,
          "image": "/media/albums/photos/photo1.jpg",
          "caption": "صورة الشاطئ"
        }
      ],
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
  ```

---

## 3. رفع صورة (Upload Photo)

### Request
- **Method**: `POST`
- **URL**: `http://localhost:8000/api/upload/`
- **Headers**: 
  ```
  Content-Type: multipart/form-data
  ```
- **Body** (form-data):
  - `album`: `1` (ID الألبوم)
  - `image`: [اختر ملف صورة]
  - `caption`: `صورة الشاطئ` (اختياري)

### حالات الاختبار:

#### ✅ حالة 1: رفع صورة بنجاح
- **album**: `1` (يجب أن يكون موجوداً)
- **image**: اختر ملف صورة (JPG, PNG, etc.)
- **caption**: "صورة الشاطئ الجميل"
- **Expected Status**: `201 Created`
- **Expected Response**:
  ```json
  {
    "id": 1,
    "album": 1,
    "image": "/media/albums/photos/photo1.jpg",
    "caption": "صورة الشاطئ الجميل"
  }
  ```

#### ✅ حالة 2: رفع صورة بدون caption
- **album**: `1`
- **image**: اختر ملف صورة
- **caption**: (اتركه فارغاً)
- **Expected Status**: `201 Created`
- **Expected Response**:
  ```json
  {
    "id": 2,
    "album": 1,
    "image": "/media/albums/photos/photo2.jpg",
    "caption": ""
  }
  ```

#### ❌ حالة 3: رفع صورة بدون album ID (خطأ)
- **album**: (اتركه فارغاً)
- **image**: اختر ملف صورة
- **Expected Status**: `500 Internal Server Error` أو `400 Bad Request`
- **Note**: قد تحتاج إلى إضافة validation في الكود

#### ❌ حالة 4: رفع صورة بدون ملف صورة (خطأ)
- **album**: `1`
- **image**: (لا ترفع ملف)
- **Expected Status**: `400 Bad Request` أو `500 Internal Server Error`

#### ❌ حالة 5: رفع صورة لألبوم غير موجود (خطأ)
- **album**: `999` (ID غير موجود)
- **image**: اختر ملف صورة
- **Expected Status**: `404 Not Found` أو `500 Internal Server Error`
- **Note**: قد تحتاج إلى إضافة error handling في `GalleryService`

#### ✅ حالة 6: رفع صور متعددة لنفس الألبوم
- **album**: `1`
- **image**: رفع صورة 1
- ثم كرر العملية مع صورة 2، 3، إلخ
- **Expected Status**: `201 Created` لكل صورة

---

## 4. سيناريوهات اختبار متكاملة

### سيناريو 1: إنشاء ألبوم وإضافة صور
1. **POST** `/api/albums/` → إنشاء ألبوم جديد
   - احفظ `id` الألبوم من الـ response
2. **POST** `/api/upload/` → رفع صورة للألبوم
   - استخدم `id` الألبوم من الخطوة السابقة
3. **GET** `/api/albums/` → التحقق من ظهور الصورة في الألبوم

### سيناريو 2: إنشاء عدة ألبومات
1. **POST** `/api/albums/` → إنشاء ألبوم 1
2. **POST** `/api/albums/` → إنشاء ألبوم 2
3. **POST** `/api/albums/` → إنشاء ألبوم 3
4. **GET** `/api/albums/` → التحقق من وجود 3 ألبومات

### سيناريو 3: رفع صور متعددة لألبوم واحد
1. **POST** `/api/albums/` → إنشاء ألبوم
2. **POST** `/api/upload/` → رفع صورة 1
3. **POST** `/api/upload/` → رفع صورة 2
4. **POST** `/api/upload/` → رفع صورة 3
5. **GET** `/api/albums/` → التحقق من وجود 3 صور في الألبوم

---

## 5. ملاحظات مهمة

### قبل البدء بالاختبار:
1. تأكد من تشغيل السيرفر:
   ```bash
   python manage.py runserver
   ```
2. تأكد من تطبيق migrations:
   ```bash
   python manage.py migrate
   ```

### في Postman:
1. استخدم **Collection** لتنظيم الطلبات
2. استخدم **Variables** لتخزين `base_url` و `album_id`
3. استخدم **Tests** tab لكتابة assertions تلقائية
4. استخدم **Pre-request Script** لحفظ `album_id` تلقائياً

### مثال على Postman Test Script:
```javascript
// في Tests tab للـ POST /api/albums/
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has album id", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.environment.set("album_id", jsonData.id);
});
```

### مثال على Pre-request Script:
```javascript
// في Pre-request Script للـ POST /api/upload/
// استخدم album_id من environment variable
pm.variables.set("album_id", pm.environment.get("album_id") || "1");
```

---

## 6. حالات Edge Cases إضافية

#### ✅ حالة: عنوان ألبوم طويل جداً (أكثر من 255 حرف)
- **Expected**: قد يفشل أو يتم قطع العنوان حسب validation

#### ✅ حالة: رفع ملف كبير جداً
- **Expected**: قد يفشل حسب إعدادات Django

#### ✅ حالة: رفع ملف ليس صورة (مثل .txt)
- **Expected**: قد يفشل حسب validation

#### ✅ حالة: رفع صورة بأسماء ملفات خاصة
- **Expected**: يجب أن يعمل بشكل صحيح

---

## 7. ملخص Endpoints

| Method | Endpoint | الوصف | Status Codes |
|--------|----------|-------|--------------|
| GET | `/api/albums/` | الحصول على جميع الألبومات | 200 |
| POST | `/api/albums/` | إنشاء ألبوم جديد | 201, 400 |
| POST | `/api/upload/` | رفع صورة | 201, 400, 404, 500 |

---

## 8. أمثلة JSON Responses

### Album Response:
```json
{
  "id": 1,
  "title": "عطلة صيفية 2024",
  "photos": [
    {
      "id": 1,
      "album": 1,
      "image": "/media/albums/photos/photo1.jpg",
      "caption": "صورة الشاطئ"
    }
  ],
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Photo Response:
```json
{
  "id": 1,
  "album": 1,
  "image": "/media/albums/photos/photo1.jpg",
  "caption": "صورة الشاطئ"
}
```

### Error Response:
```json
{
  "error": "Title is required"
}
```

