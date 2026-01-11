# دليل نظام تعدد اللغات / Multilingual System Guide

## نظرة عامة / Overview

تم إضافة نظام تعدد اللغات شامل للتطبيق يدعم العربية والإنجليزية مع زر تبديل جميل وانتقالات سلسة.

A comprehensive multilingual system has been added to the application supporting Arabic and English with a beautiful toggle button and smooth transitions.

## الميزات المضافة / Added Features

### 🌐 نظام الترجمة / Translation System
- دعم كامل للعربية والإنجليزية
- ترجمات شاملة لجميع النصوص في التطبيق
- حفظ اللغة المختارة في localStorage
- Full Arabic and English support
- Comprehensive translations for all app texts
- Language preference saved in localStorage

### 🎨 زر تبديل اللغة / Language Toggle Button
- تصميم جميل مع انتقالات سلسة
- أيقونات تفاعلية (🌙 للعربية، ☀️ للإنجليزية)
- أصوات تفاعلية عند التبديل
- Beautiful design with smooth transitions
- Interactive icons (🌙 for Arabic, ☀️ for English)
- Interactive sounds when switching

### 📱 دعم RTL/LTR / RTL/LTR Support
- تبديل تلقائي لاتجاه النص
- دعم كامل للتخطيط من اليمين لليسار
- خطوط مختلفة لكل لغة (Cairo للعربية، Inter للإنجليزية)
- Automatic text direction switching
- Full right-to-left layout support
- Different fonts for each language (Cairo for Arabic, Inter for English)

## الملفات المضافة / Added Files

```
src/
├── locales/
│   └── translations.ts          # ملف الترجمات الرئيسي
├── contexts/
│   └── LanguageContext.tsx      # Context للغة
└── components/
    └── LanguageToggle/
        ├── LanguageToggle.tsx   # مكون زر التبديل
        └── LanguageToggle.css   # تنسيقات الزر
```

## كيفية الاستخدام / How to Use

### 1. استخدام Hook اللغة / Using Language Hook

```tsx
import { useLanguage } from '../contexts/LanguageContext';

function MyComponent() {
  const { t, language, setLanguage, isRTL } = useLanguage();
  
  return (
    <div className={isRTL ? 'rtl' : 'ltr'}>
      <h1>{t.common.title}</h1>
      <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}>
        {t.common.switchLanguage}
      </button>
    </div>
  );
}
```

### 2. إضافة ترجمات جديدة / Adding New Translations

في ملف `src/locales/translations.ts`:

```typescript
export const translations = {
  ar: {
    newSection: {
      title: 'العنوان الجديد',
      description: 'الوصف الجديد'
    }
  },
  en: {
    newSection: {
      title: 'New Title',
      description: 'New Description'
    }
  }
};
```

### 3. دعم RTL في CSS / RTL Support in CSS

```css
.my-component {
  padding: 20px;
  text-align: right; /* للعربية */
}

.my-component.ltr {
  text-align: left; /* للإنجليزية */
}

.rtl .my-component {
  direction: rtl;
}

.ltr .my-component {
  direction: ltr;
}
```

## الترجمات المتاحة / Available Translations

### الأقسام الرئيسية / Main Sections
- `common` - النصوص المشتركة / Common texts
- `nav` - التنقل / Navigation
- `dashboard` - لوحة التحكم / Dashboard
- `courses` - الكورسات / Courses
- `modules` - الوحدات / Modules
- `lessons` - الدروس / Lessons
- `modal` - النوافذ المنبثقة / Modals

### أمثلة الاستخدام / Usage Examples

```tsx
// النصوص المشتركة
t.common.loading    // "جاري التحميل..." / "Loading..."
t.common.save       // "حفظ" / "Save"
t.common.cancel     // "إلغاء" / "Cancel"

// التنقل
t.nav.dashboard     // "لوحة التحكم" / "Dashboard"
t.nav.courses       // "الكورسات" / "Courses"

// الدروس
t.lessons.title     // "إدارة الدروس" / "Manage Lessons"
t.lessons.createNew // "إنشاء درس جديد" / "Create New Lesson"
```

## التخصيص / Customization

### تغيير الخطوط / Changing Fonts
في `src/App.css`:

```css
body.rtl {
  font-family: 'Cairo', 'Segoe UI', sans-serif;
}

body.ltr {
  font-family: 'Inter', 'Segoe UI', sans-serif;
}
```

### تخصيص زر التبديل / Customizing Toggle Button
في `src/components/LanguageToggle/LanguageToggle.css`:

```css
.language-toggle {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* يمكن تغيير الألوان والتأثيرات هنا */
}
```

## الميزات التقنية / Technical Features

### 🔄 الانتقالات السلسة / Smooth Transitions
- انتقالات CSS للاتجاه والخط
- انيميشن عند تبديل اللغة
- تأثيرات بصرية جميلة

### 💾 حفظ التفضيلات / Preference Saving
- حفظ اللغة في localStorage
- استرجاع اللغة عند إعادة تحميل الصفحة
- تطبيق الإعدادات على document.documentElement

### 🎵 التأثيرات الصوتية / Sound Effects
- أصوات تفاعلية عند التبديل
- تحسين تجربة المستخدم

## المتطلبات / Requirements

- React 18+
- TypeScript
- CSS3 (لدعم الانتقالات)

## الدعم / Support

النظام يدعم:
- ✅ جميع المتصفحات الحديثة
- ✅ الأجهزة المحمولة
- ✅ قارئات الشاشة
- ✅ لوحات المفاتيح

The system supports:
- ✅ All modern browsers
- ✅ Mobile devices  
- ✅ Screen readers
- ✅ Keyboard navigation

---

## مثال كامل / Complete Example

```tsx
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle/LanguageToggle';

export const MyPage: React.FC = () => {
  const { t, isRTL } = useLanguage();

  return (
    <div className={`page-container ${isRTL ? 'rtl' : 'ltr'}`}>
      <header>
        <h1>{t.common.title}</h1>
        <LanguageToggle />
      </header>
      
      <main>
        <p>{t.common.description}</p>
        <button>{t.common.save}</button>
      </main>
    </div>
  );
};
```

تم إنشاء نظام تعدد اللغات بنجاح! 🎉
Multilingual system created successfully! 🎉