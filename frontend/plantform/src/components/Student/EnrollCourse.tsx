// src/components/Student/EnrollCourse.tsx
import React, { useState, useEffect } from 'react';
import { CourseService } from '../../services/course.service';
import { StudentService } from '../../services/student.service.ts';
import type { Course } from '../../types/course.types';
import { useLanguage } from '../../contexts/LanguageContext';
import { studentTranslations } from '../../locales/studentTranslations';
import './EnrollCourse.css';

interface Props {
  onEnrollSuccess: () => void;
}

export const EnrollCourse: React.FC<Props> = ({ onEnrollSuccess }) => {
  const { language, isRTL } = useLanguage();
  const t = studentTranslations[language];
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const data = await CourseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const playSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OihUBELTqjj8bllHAU2jdXwyXcsBS2A0PLaizsKG2m98OmiURAMUKXh8bllHAU3jtbwyXYrBSuCz/HajDkIG2i76+ifTxALTqfi8LdlGwU5j9XwxnQpBSqBzvHaizsIHGm87emhURARTqXg8LZkHAU4j9TwyHUrBSuBzvLajDcIGmi87+mjVBAMUKXg8bhlHQY5j9TwyHMrBSqBz/HajDgIG2m87+mjTxALT6Xi8L');
    audio.play().catch(() => {});
  };

  const handleEnroll = async (courseId: number) => {
    setEnrollingId(courseId);
    playSound();
    try {
      await StudentService.enrollInCourse(courseId);
      alert(t.enrollSuccess);
      onEnrollSuccess();
    } catch (error: any) {
      console.error('Error enrolling:', error);
      alert(error.response?.data?.detail || t.enrollError);
    } finally {
      setEnrollingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="enroll-loading">
        <div className="loading-spinner"></div>
        <p>{t.loadingCourses}</p>
      </div>
    );
  }

  return (
    <div className={`enroll-container ${isRTL ? 'rtl' : 'ltr'}`}>
      <h2 className="enroll-title">
        <span className="title-icon">🎓</span>
        {t.availableCourses}
      </h2>
      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course.id} className="enroll-card">
            <div className="enroll-watermark">🎓</div>
            <div className="enroll-header">
              <div className="enroll-icon">📚</div>
              <div className="enroll-badge">{course.modules?.length || 0} {t.modules}</div>
            </div>
            <h3 className="enroll-course-title">{course.title}</h3>
            <p className="enroll-description">{course.description}</p>
            <div className="enroll-meta">
              <div className="meta-item">
                <span>👨‍🏫</span>
                <span>{t.instructor}: {course.instructor}</span>
              </div>
            </div>
            <button
              className="btn-enroll"
              onClick={() => handleEnroll(course.id)}
              disabled={enrollingId === course.id}
            >
              {enrollingId === course.id ? (
                <>
                  <span className="spinner"></span>
                  {t.enrolling}
                </>
              ) : (
                <>
                  <span>✨</span>
                  {t.enrollNow}
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};