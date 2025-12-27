     نظام إدارة المكتبة (LMS)
     Library Management System


📚 وصف التطبيق:
نظام إدارة مكتبة مبني بـ Django REST Framework يتيح إدارة الكتب والمستخدمين والمعاملات.

========================================
🎯 المتطلبات الأساسية (MVP):
========================================

✅ 1. المصادقة والمستخدمين (Authentication)
   - تسجيل مستخدم جديد (Register)
   - تسجيل دخول (Login)
   - استخدام JWT للمصادقة

✅ 2. إدارة المخزون (Inventory Management)
   - إضافة كتب جديدة (Admin Only)
   - عرض جميع الكتب
   - تعديل معلومات الكتاب (Admin Only)
   - حذف كتب (Admin Only)
   - إدارة كمية الكتب المتاحة

✅ 3. المعاملات (Transactions)
   - استعارة الكتب (Borrow)
   - إرجاع الكتب (Return)
   - تتبع حالة الكتاب

✅ 4. التحدي الإضافي (Challenge)
   - رفع صور أغلفة الكتب
   - تخزين الصور
   - عرض الصور للمستخدمين

========================================
🚀 كيفية تشغيل التطبيق:
========================================

1. تشغيل الخادم:
   python manage.py runserver

2. فتح المتصفح:
   http://127.0.0.1:8000/

3. لوحة التحكم (Admin):
   http://127.0.0.1:8000/admin/
   - Username: admin
   - Password: admin123

========================================
📋 APIs المتاحة:
========================================

🎯 تسجيل مستخدم جديد:
POST http://127.0.0.1:8000/api/signup/
Body: {"username": "user", "email": "user@example.com", "password": "pass123"}

🎯 تسجيل الدخول:
POST http://127.0.0.1:8000/api/login/
Body: {"username": "admin", "password": "admin123"}

🎯 عرض الكتب:
GET http://127.0.0.1:8000/api/books/

🎯 إضافة كتاب (Admin Only):
POST http://127.0.0.1:8000/api/books/
Headers: Authorization: Bearer [token]
Body: {"title": "Book Title", "author": "Author Name", "quantity": 10}

🎯 تعديل كتاب (Admin Only):
PUT http://127.0.0.1:8000/api/books/[id]/
Headers: Authorization: Bearer [token]
Body: {"title": "New Title", "quantity": 15}

🎯 حذف كتاب (Admin Only):
DELETE http://127.0.0.1:8000/api/books/[id]/
Headers: Authorization: Bearer [token]

🎯 استعارة كتاب:
POST http://127.0.0.1:8000/api/borrow/[book_id]/
Headers: Authorization: Bearer [token]

🎯 إرجاع كتاب:
POST http://127.0.0.1:8000/api/return/[book_id]/
Headers: Authorization: Bearer [token]

========================================
🔧 ملفات المشروع:
========================================

📁 library/
├── 📄 __init__.py
├── 📄 admin.py          # إعدادات لوحة التحكم
├── 📄 apps.py
├── 📄 models.py         # نماذج البيانات (Book, Transaction)
├── 📄 urls.py           # روابط APIs
├── 📄 views.py          # منطق APIs
├── 📁 model/
│   └── 📄 models.py     # نماذج البيانات الرئيسية
├── 📁 serializer/
│   └── 📄 serializers.py # تحويل البيانات
├── 📁 service/
│   └── 📄 services.py   # منطق الأعمال
└── 📁 view/
    └── 📄 views.py      # views الرئيسية

📁 lms/
├── 📄 settings.py       # إعدادات المشروع
├── 📄 urls.py          # روابط المشروع الرئيسية
├── 📄 wsgi.py
└── 📄 asgi.py

📄 manage.py            # أداة إدارة Django
📄 db.sqlite3           # قاعدة البيانات
📄 README.txt           # هذا الملف

========================================
🎯 كيف يعمل الكود:
========================================

1. 📝 النماذج (Models):
   - Book: يحتوي على title, author, quantity, cover_image
   - Transaction: يسجل عمليات الاستعارة والإرجاع

2. 🔐 المصادقة (Authentication):
   - JWT tokens للمصادقة الآمنة
   - Admin users لديهم صلاحيات إضافية

3. 📊 APIs:
   - RESTful APIs لجميع العمليات
   - JSON responses
   - HTTP status codes مناسبة

4. 🎨 الواجهة:
   - Django Admin لإدارة البيانات
   - Postman لاختبار APIs

========================================
⚠️ ملاحظات مهمة:
========================================

🔑 بيانات Admin الافتراضية:
- Username: admin
- Password: admin123

🗄️ قاعدة البيانات:
- SQLite (سهلة ولا تحتاج تثبيت إضافي)
- يمكن تغييرها إلى MySQL/PostgreSQL للإنتاج

🖼️ رفع الصور:
- الصور تُحفظ في مجلد media/
- URL: /media/books/filename.jpg

🔐 الأمان:
- JWT tokens (تنتهي صلاحيتها)
- Admin permissions للعمليات الحساسة

========================================
🧪 كيفية الاختبار:
========================================

1. شغل الخادم:
   python manage.py runserver

2. في Postman:
   - سجل دخول كـ admin
   - انسخ الـ access token
   - اختبر جميع APIs

3. في المتصفح:
   - http://127.0.0.1:8000/admin/
   - إدارة الكتب والمستخدمين

========================================
📞 الدعم والمساعدة:
========================================

إذا واجهت أي مشاكل:
1. تحقق من تشغيل الخادم
2. تأكد من صحة URLs
3. تحقق من الـ tokens
4. راجع console للأخطاء

========================================
🎉 تم بنجاح - نظام مكتبة كامل!
========================================
