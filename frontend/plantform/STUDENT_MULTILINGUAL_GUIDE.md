# دليل نظام اللغات المتعددة للطلاب
# Student Multilingual System Guide

## نظرة عامة / Overview

تم إضافة نظام اللغات المتعددة (عربي/إنجليزي) إلى لوحة الطالب مع أزرار تبديل اللغة وتسجيل الخروج المتحركة والجميلة.

A multilingual system (Arabic/English) has been added to the student dashboard with beautiful animated language toggle and logout buttons.

## المكونات الجديدة / New Components

### 1. LanguageToggle
- زر تبديل اللغة مع تأثيرات متحركة جميلة
- Beautiful animated language toggle button
- يدعم العربية والإنجليزية مع أعلام الدول
- Supports Arabic and English with country flags
- تأثيرات صوتية عند التبديل
- Sound effects on toggle

### 2. LogoutButton
- زر تسجيل الخروج مع تأكيد
- Logout button with confirmation
- تصميم متناسق مع ألوان اللوحة
- Design consistent with dashboard colors
- تأثيرات متحركة وصوتية
- Animated and sound effects

### 3. LanguageLogoutControls
- مكون يجمع أزرار اللغة وتسجيل الخروج
- Component combining language and logout buttons
- تصميم متجاوب ودعم RTL
- Responsive design with RTL support

### 4. StudentDashboard
- لوحة طالب شاملة مع جميع المكونات
- Complete student dashboard with all components
- تنقل سهل بين الأقسام المختلفة
- Easy navigation between different sections

## الميزات / Features

### 🌐 دعم اللغات المتعددة
- العربية (RTL)
- الإنجليزية (LTR)
- تبديل فوري للغة
- حفظ اللغة المختارة في localStorage

### 🎨 تصميم جميل ومتحرك
- تأثيرات CSS متقدمة
- انتقالات سلسة
- ألوان متناسقة مع لوحة الطالب
- تصميم متجاوب للجوال

### 🔊 تأثيرات صوتية
- أصوات عند النقر على الأزرار
- تحسين تجربة المستخدم

### 🔐 أمان محسن
- تأكيد قبل تسجيل الخروج
- تنظيف localStorage عند الخروج

## كيفية الاستخدام / Usage

### استخدام المكونات منفردة / Using Individual Components

```tsx
import { LanguageToggle } from '../components/LanguageToggle/LanguageToggle';
import { LogoutButton } from '../components/auth/LogoutButton';

// زر تبديل اللغة / Language Toggle
<LanguageToggle />

// زر تسجيل الخروج / Logout Button
<LogoutButton onLogout={() => console.log('Logged out')} />
```

### استخدام المكون المجمع / Using Combined Component

```tsx
import { LanguageLogoutControls } from '../components/Student/LanguageLogoutControls';

<LanguageLogoutControls 
  onLogout={() => {
    // منطق تسجيل الخروج / Logout logic
    localStorage.clear();
    window.location.href = '/login';
  }} 
/>
```

### استخدام لوحة الطالب الكاملة / Using Complete Student Dashboard

```tsx
import { StudentDashboard } from '../components/Student/StudentDashboard';
import { LanguageProvider } from '../contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <StudentDashboard />
    </LanguageProvider>
  );
}
```

## التخصيص / Customization

### تخصيص الألوان / Color Customization

يمكن تخصيص الألوان في ملفات CSS:

```css
/* تخصيص زر اللغة / Language Button Customization */
.language-toggle {
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}

/* تخصيص زر تسجيل الخروج / Logout Button Customization */
.logout-button {
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

### إضافة لغات جديدة / Adding New Languages

1. حدث `studentTranslations.ts`:
```typescript
export const studentTranslations = {
  ar: { /* النصوص العربية */ },
  en: { /* English texts */ },
  fr: { /* Textes français */ }, // لغة جديدة
};
```

2. حدث `LanguageContext.tsx`:
```typescript
type Language = 'ar' | 'en' | 'fr'; // أضف اللغة الجديدة
```

## الملفات المحدثة / Updated Files

### مكونات جديدة / New Components
- `src/components/LanguageToggle/LanguageToggle.tsx`
- `src/components/LanguageToggle/LanguageToggle.css`
- `src/components/auth/LogoutButton.tsx`
- `src/components/auth/LogoutButton.css`
- `src/components/Student/StudentDashboard.tsx`
- `src/components/Student/StudentDashboard.css`

### ملفات محدثة / Updated Files
- `src/components/Student/LanguageLogoutControls.tsx`
- `src/components/Student/LanguageLogoutControls.css`
- `src/components/Student/ViewContent.tsx`
- `src/components/Student/ViewContent.css`
- `src/components/Student/EnrollCourse.tsx`
- `src/components/Student/EnrollCourse.css`
- `src/contexts/LanguageContext.tsx`
- `src/locales/studentTranslations.ts`

## المتطلبات / Requirements

- React 18+
- TypeScript
- CSS3 (للتأثيرات المتحركة)
- Context API (للغات)

## الدعم / Support

- دعم كامل للعربية (RTL)
- دعم كامل للإنجليزية (LTR)
- تصميم متجاوب للجوال
- متوافق مع جميع المتصفحات الحديثة

## ملاحظات مهمة / Important Notes

1. تأكد من تغليف التطبيق بـ `LanguageProvider`
2. جميع النصوص يجب أن تأتي من ملف الترجمات
3. استخدم `useLanguage` hook للوصول للغة الحالية
4. الأصوات اختيارية ولن تؤثر على الوظائف إذا فشلت

---

تم إنشاء هذا النظام ليوفر تجربة مستخدم ممتازة للطلاب مع دعم كامل للغات المتعددة والتصميم الجميل.

This system was created to provide an excellent user experience for students with full multilingual support and beautiful design.