// src/locales/translations.ts

export interface Translations {
  // Common
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    confirm: string;
    success: string;
    error: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    filter: string;
    sort: string;
    actions: string;
  };

  // Navigation
  nav: {
    dashboard: string;
    courses: string;
    modules: string;
    lessons: string;
    logout: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    welcome: string;
    instructor: string;
    stats: {
      courses: string;
      modules: string;
      lessons: string;
      videos: string;
    };
  };

  // Courses
  courses: {
    title: string;
    subtitle: string;
    createNew: string;
    noCourses: string;
    noCoursesDesc: string;
    createAction: string;
    moduleCount: string;
    instructor: string;
    createdAt: string;
    deleting: string;
    form: {
      title: string;
      description: string;
      titlePlaceholder: string;
      descriptionPlaceholder: string;
      titleRequired: string;
      titleTooShort: string;
      descriptionRequired: string;
      descriptionTooShort: string;
    };
    messages: {
      created: string;
      updated: string;
      deleted: string;
      deleteConfirm: string;
      error: string;
    };
  };

  // Modules
  modules: {
    title: string;
    subtitle: string;
    createNew: string;
    noModules: string;
    noModulesDesc: string;
    createAction: string;
    lessonsCount: string;
    lesson: string;
    lessons: string;
    complete: string;
    keepIt: string;
    yesDelete: string;
    deleting: string;
    areYouSure: string;
    form: {
      title: string;
      description: string;
      course: string;
      order: string;
      titlePlaceholder: string;
      descriptionPlaceholder: string;
      selectCourse: string;
      titleRequired: string;
      descriptionRequired: string;
      courseRequired: string;
      orderRequired: string;
    };
    messages: {
      created: string;
      updated: string;
      deleted: string;
      deleteConfirm: string;
    };
  };

  // Lessons
  lessons: {
    title: string;
    subtitle: string;
    createNew: string;
    noLessons: string;
    noLessonsDesc: string;
    viewContent: string;
    viewVideo: string;
    form: {
      title: string;
      content: string;
      order: string;
      module: string;
      videoFile: string;
      titlePlaceholder: string;
      contentPlaceholder: string;
      selectModule: string;
      selectVideo: string;
      titleRequired: string;
      contentRequired: string;
      moduleRequired: string;
      orderRequired: string;
    };
    messages: {
      created: string;
      updated: string;
      deleted: string;
      deleteConfirm: string;
      loadingContent: string;
      loadingVideo: string;
      noVideo: string;
    };
  };

  // Modal
  modal: {
    create: string;
    edit: string;
    saving: string;
  };
}

export const translations: Record<'ar' | 'en', Translations> = {
  ar: {
    common: {
      loading: 'جاري التحميل...',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      create: 'إنشاء',
      confirm: 'تأكيد',
      success: 'نجح',
      error: 'خطأ',
      close: 'إغلاق',
      back: 'رجوع',
      next: 'التالي',
      previous: 'السابق',
      search: 'بحث',
      filter: 'تصفية',
      sort: 'ترتيب',
      actions: 'إجراءات',
    },
    nav: {
      dashboard: 'لوحة التحكم',
      courses: 'الكورسات',
      modules: 'الوحدات',
      lessons: 'الدروس',
      logout: 'تسجيل خروج',
    },
    dashboard: {
      title: 'لوحة التحكم',
      welcome: 'مرحباً بك',
      instructor: 'المعلم',
      stats: {
        courses: 'كورس',
        modules: 'وحدة',
        lessons: 'درس',
        videos: 'فيديو',
      },
    },
    courses: {
      title: 'إدارة الكورسات',
      subtitle: 'قم بإنشاء وإدارة كورساتك التعليمية بكل سهولة',
      createNew: 'إنشاء كورس جديد',
      noCourses: 'لا توجد كورسات بعد',
      noCoursesDesc: 'ابدأ بإنشاء أول كورس لك الآن!',
      createAction: 'إنشاء كورس',
      moduleCount: 'وحدة',
      instructor: 'المعلم',
      createdAt: 'تاريخ الإنشاء',
      deleting: 'جاري الحذف...',
      form: {
        title: 'عنوان الكورس',
        description: 'وصف الكورس',
        titlePlaceholder: 'أدخل عنوان الكورس...',
        descriptionPlaceholder: 'أدخل وصف الكورس...',
        titleRequired: 'العنوان مطلوب 📝',
        titleTooShort: 'العنوان قصير جداً ⚠️',
        descriptionRequired: 'الوصف مطلوب 📄',
        descriptionTooShort: 'الوصف قصير جداً ⚠️',
      },
      messages: {
        created: '✅ تم إنشاء الكورس بنجاح!',
        updated: '✅ تم تحديث الكورس بنجاح!',
        deleted: '✅ تم حذف الكورس بنجاح!',
        deleteConfirm: '🗑️ هل أنت متأكد من حذف هذا الكورس؟',
        error: '❌ حدث خطأ أثناء حفظ الكورس',
      },
    },
    modules: {
      title: 'إدارة الوحدات',
      subtitle: 'قم بإنشاء وإدارة وحدات كورساتك',
      createNew: 'إنشاء وحدة جديدة',
      noModules: 'لا توجد وحدات بعد',
      noModulesDesc: 'ابدأ بإنشاء أول وحدة لك الآن!',
      createAction: 'إنشاء وحدة',
      lessonsCount: 'درس',
      lesson: 'درس',
      lessons: 'دروس',
      complete: 'مكتمل',
      keepIt: 'الاحتفاظ بها',
      yesDelete: 'نعم، احذف',
      deleting: 'جاري الحذف...',
      areYouSure: '⚠️ هل أنت متأكد من حذف هذه الوحدة؟',
      form: {
        title: 'عنوان الوحدة',
        description: 'وصف الوحدة',
        course: 'الكورس',
        order: 'الترتيب',
        titlePlaceholder: 'أدخل عنوان الوحدة...',
        descriptionPlaceholder: 'أدخل وصف الوحدة...',
        selectCourse: 'اختر الكورس...',
        titleRequired: 'العنوان مطلوب 📝',
        descriptionRequired: 'الوصف مطلوب 📄',
        courseRequired: 'يجب اختيار كورس 📚',
        orderRequired: 'الترتيب يجب أن يكون 1 أو أكثر ⚠️',
      },
      messages: {
        created: '✅ تم إنشاء الوحدة بنجاح!',
        updated: '✅ تم تحديث الوحدة بنجاح!',
        deleted: '✅ تم حذف الوحدة بنجاح!',
        deleteConfirm: '🗑️ هل أنت متأكد من حذف هذه الوحدة؟',
      },
    },
    lessons: {
      title: 'إدارة الدروس',
      subtitle: 'قم بإنشاء وإدارة دروسك التعليمية مع المحتوى والفيديو',
      createNew: 'إنشاء درس جديد',
      noLessons: 'لا توجد دروس بعد',
      noLessonsDesc: 'ابدأ بإنشاء أول درس لك الآن!',
      viewContent: 'عرض المحتوى',
      viewVideo: 'عرض الفيديو',
      form: {
        title: 'عنوان الدرس',
        content: 'المحتوى (Markdown)',
        order: 'الترتيب',
        module: 'الوحدة',
        videoFile: 'ملف الفيديو (اختياري)',
        titlePlaceholder: 'أدخل عنوان الدرس...',
        contentPlaceholder: '## Welcome\nThis is *markdown* content...',
        selectModule: 'اختر الوحدة...',
        selectVideo: 'اختر ملف فيديو...',
        titleRequired: 'العنوان مطلوب 📝',
        contentRequired: 'المحتوى مطلوب 📄',
        moduleRequired: 'يجب اختيار وحدة 📦',
        orderRequired: 'الترتيب يجب أن يكون 1 أو أكثر ⚠️',
      },
      messages: {
        created: '✅ تم إنشاء الدرس بنجاح!',
        updated: '✅ تم تحديث الدرس بنجاح!',
        deleted: '✅ تم حذف الدرس بنجاح!',
        deleteConfirm: '🗑️ هل أنت متأكد من حذف هذا الدرس؟',
        loadingContent: 'جاري تحميل المحتوى...',
        loadingVideo: 'جاري تحميل الفيديو...',
        noVideo: 'لا يوجد فيديو لهذا الدرس',
      },
    },
    modal: {
      create: 'إنشاء',
      edit: 'تعديل',
      saving: 'جاري الحفظ...',
    },
  },
  en: {
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      confirm: 'Confirm',
      success: 'Success',
      error: 'Error',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      actions: 'Actions',
    },
    nav: {
      dashboard: 'Dashboard',
      courses: 'Courses',
      modules: 'Modules',
      lessons: 'Lessons',
      logout: 'Logout',
    },
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome',
      instructor: 'Instructor',
      stats: {
        courses: 'Course',
        modules: 'Module',
        lessons: 'Lesson',
        videos: 'Video',
      },
    },
    courses: {
      title: 'Manage Courses',
      subtitle: 'Create and manage your educational courses with ease',
      createNew: 'Create New Course',
      noCourses: 'No courses yet',
      noCoursesDesc: 'Start by creating your first course now!',
      createAction: 'Create Course',
      moduleCount: 'module',
      instructor: 'Instructor',
      createdAt: 'Created',
      deleting: 'Deleting...',
      form: {
        title: 'Course Title',
        description: 'Course Description',
        titlePlaceholder: 'Enter course title...',
        descriptionPlaceholder: 'Enter course description...',
        titleRequired: 'Title is required 📝',
        titleTooShort: 'Title is too short ⚠️',
        descriptionRequired: 'Description is required 📄',
        descriptionTooShort: 'Description is too short ⚠️',
      },
      messages: {
        created: '✅ Course created successfully!',
        updated: '✅ Course updated successfully!',
        deleted: '✅ Course deleted successfully!',
        deleteConfirm: '🗑️ Are you sure you want to delete this course?',
        error: '❌ Error occurred while saving course',
      },
    },
    modules: {
      title: 'Manage Modules',
      subtitle: 'Create and manage your course modules',
      createNew: 'Create New Module',
      noModules: 'No modules yet',
      noModulesDesc: 'Start by creating your first module now!',
      createAction: 'Create Module',
      lessonsCount: 'lesson',
      lesson: 'Lesson',
      lessons: 'Lessons',
      complete: 'Complete',
      keepIt: 'Keep It',
      yesDelete: 'Yes, Delete',
      deleting: 'Deleting...',
      areYouSure: '⚠️ Are you sure you want to delete this module?',
      form: {
        title: 'Module Title',
        description: 'Module Description',
        course: 'Course',
        order: 'Order',
        titlePlaceholder: 'Enter module title...',
        descriptionPlaceholder: 'Enter module description...',
        selectCourse: 'Select course...',
        titleRequired: 'Title is required 📝',
        descriptionRequired: 'Description is required 📄',
        courseRequired: 'Course selection is required 📚',
        orderRequired: 'Order must be 1 or greater ⚠️',
      },
      messages: {
        created: '✅ Module created successfully!',
        updated: '✅ Module updated successfully!',
        deleted: '✅ Module deleted successfully!',
        deleteConfirm: '🗑️ Are you sure you want to delete this module?',
      },
    },
    lessons: {
      title: 'Manage Lessons',
      subtitle: 'Create and manage your educational lessons with content and video',
      createNew: 'Create New Lesson',
      noLessons: 'No lessons yet',
      noLessonsDesc: 'Start by creating your first lesson now!',
      viewContent: 'View Content',
      viewVideo: 'View Video',
      form: {
        title: 'Lesson Title',
        content: 'Content (Markdown)',
        order: 'Order',
        module: 'Module',
        videoFile: 'Video File (Optional)',
        titlePlaceholder: 'Enter lesson title...',
        contentPlaceholder: '## Welcome\nThis is *markdown* content...',
        selectModule: 'Select module...',
        selectVideo: 'Choose video file...',
        titleRequired: 'Title is required 📝',
        contentRequired: 'Content is required 📄',
        moduleRequired: 'Module selection is required 📦',
        orderRequired: 'Order must be 1 or greater ⚠️',
      },
      messages: {
        created: '✅ Lesson created successfully!',
        updated: '✅ Lesson updated successfully!',
        deleted: '✅ Lesson deleted successfully!',
        deleteConfirm: '🗑️ Are you sure you want to delete this lesson?',
        loadingContent: 'Loading content...',
        loadingVideo: 'Loading video...',
        noVideo: 'No video available for this lesson',
      },
    },
    modal: {
      create: 'Create',
      edit: 'Edit',
      saving: 'Saving...',
    },
  },
};