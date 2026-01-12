// src/components/Student/CompletedLessons.tsx
import React, { useState, useEffect } from 'react';
import { StudentService } from '../../services/student.service.ts';
import type { Lesson } from '../../types/lesson.types';
import { useLanguage } from '../../contexts/LanguageContext';
import { studentTranslations } from '../../locales/studentTranslations';
import './CompletedLessons.css';

export const CompletedLessons: React.FC = () => {
  const { language, isRTL } = useLanguage();
  const t = studentTranslations[language];
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    loadCompletedLessons();
  }, []);

  const loadCompletedLessons = async () => {
    setIsLoading(true);
    try {
      const data = await StudentService.getCompletedLessons();
      setLessons(data.results);
      setCount(data.count);
    } catch (error) {
      console.error('Error loading completed lessons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('plantform-token');
    localStorage.removeItem('plantform-user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="completed-loading">
        <div className="loading-spinner"></div>
        <p>{t.loadingCompleted}</p>
      </div>
    );
  }

  return (
    <div className={`completed-container ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="completed-header">
        <h2 className="completed-title">
          <span className="title-icon">🎉</span>
          {t.completedLessonsTitle}
        </h2>
        <div className="completed-count">
          <span className="count-number">{count}</span>
          <span className="count-label">{t.completedCount}</span>
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="completed-empty">
          <div className="empty-icon">📭</div>
          <h3>{t.noCompletedLessons}</h3>
          <p>{t.startCompleting}</p>
        </div>
      ) : (
        <div className="completed-grid">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="completed-card">
              <div className="completed-watermark">🏆</div>
              <div className="completed-badge">
                <span>✅</span>
                {t.completed}
              </div>
              <div className="completed-icon">📖</div>
              <h3 className="completed-lesson-title">{lesson.title}</h3>
              <div className="completed-meta">
                <span>🔢 {t.order}: {lesson.order}</span>
                {lesson.video_file && <span>🎥 {t.video}</span>}
              </div>
              <div className="completed-celebration">
                <span className="celebration-emoji">🎊</span>
                <span className="celebration-emoji">🎉</span>
                <span className="celebration-emoji">⭐</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};