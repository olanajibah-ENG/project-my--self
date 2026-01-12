// src/components/Student/SelectCompleted.tsx
import React, { useState, useEffect } from 'react';
import { LessonService } from '../../services/lesson.service.ts';
import { StudentService } from '../../services/student.service.ts';
import type { Lesson } from '../../types/lesson.types';
import { useLanguage } from '../../contexts/LanguageContext';
import { studentTranslations } from '../../locales/studentTranslations';
import './SelectCompleted.css';

export const SelectCompleted: React.FC = () => {
  const { language, isRTL } = useLanguage();
  const t = studentTranslations[language];
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completingId, setCompletingId] = useState<number | null>(null);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    setIsLoading(true);
    try {
      const data = await LessonService.getAllLessons();
      setLessons(data.results);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const playSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OihUBELTqjj8bllHAU2jdXwyXcsBS2A0PLaizsKG2m98OmiURAMUKXh8bllHAU3jtbwyXYrBSuCz/HajDkIG2i76+ifTxALTqfi8LdlGwU5j9XwxnQpBSqBzvHaizsIHGm87emhURARTqXg8LZkHAU4j9TwyHUrBSuBzvLajDcIGmi87+mjVBAMUKXg8bhlHQY5j9TwyHMrBSqBz/HajDgIG2m87+mjTxALT6Xi8L');
    audio.play().catch(() => {});
  };

  const handleMarkComplete = async (lessonId: number) => {
    setCompletingId(lessonId);
    playSound();
    try {
      await StudentService.markLessonComplete(lessonId);
      alert(t.markCompleteSuccess);
    } catch (error: any) {
      console.error('Error marking complete:', error);
      alert(error.response?.data?.detail || t.markCompleteError);
    } finally {
      setCompletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="select-loading">
        <div className="loading-spinner"></div>
        <p>{t.loadingLessons}</p>
      </div>
    );
  }

  return (
    <div className={`select-container ${isRTL ? 'rtl' : 'ltr'}`}>
      <h2 className="select-title">
        <span className="title-icon">✅</span>
        {t.selectCompletedLessons}
      </h2>
      <div className="lessons-grid">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="select-card">
            <div className="select-watermark">✅</div>
            <div className="select-header">
              <div className="select-icon">📖</div>
              <div className="select-order">#{lesson.order}</div>
            </div>
            <h3 className="select-lesson-title">{lesson.title}</h3>
            <button
              className="btn-mark-complete"
              onClick={() => handleMarkComplete(lesson.id)}
              disabled={completingId === lesson.id}
            >
              {completingId === lesson.id ? (
                <>
                  <span className="spinner"></span>
                  {t.saving}
                </>
              ) : (
                <>
                  <span>✅</span>
                  {t.markComplete}
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};