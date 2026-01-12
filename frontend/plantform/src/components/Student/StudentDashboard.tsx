// src/components/Student/StudentDashboard.tsx
import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { studentTranslations } from '../../locales/studentTranslations';
import { EnrollCourse } from './EnrollCourse';
import { ViewContent } from './ViewContent';
import { SelectCompleted } from './SelectCompleted';
import { CompletedLessons } from './CompletedLessons';
import { LanguageLogoutControls } from './LanguageLogoutControls';
import './StudentDashboard.css';

type DashboardView = 'enroll' | 'content' | 'select' | 'completed';

export const StudentDashboard: React.FC = () => {
  const { language, isRTL } = useLanguage();
  const t = studentTranslations[language];
  const [currentView, setCurrentView] = useState<DashboardView>('enroll');

  const playSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OihUBELTqjj8bllHAU2jdXwyXcsBS2A0PLaizsKG2m98OmiURAMUKXh8bllHAU3jtbwyXYrBSuCz/HajDkIG2i76+ifTxALTqfi8LdlGwU5j9XwxnQpBSqBzvHaizsIHGm87emhURARTqXg8LZkHAU4j9TwyHUrBSuBzvLajDcIGmi87+mjVBAMUKXg8bhlHQY5j9TwyHMrBSqBz/HajDgIG2m87+mjTxALT6Xi8L');
    audio.play().catch(() => {});
  };

  const handleViewChange = (view: DashboardView) => {
    playSound();
    setCurrentView(view);
  };

  const handleLogout = () => {
    localStorage.removeItem('plantform-token');
    localStorage.removeItem('plantform-user');
    window.location.href = '/login';
  };

  const handleEnrollSuccess = () => {
    // Optionally switch to content view after successful enrollment
    setCurrentView('content');
  };

  return (
    <div className={`student-dashboard ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">🎓</span>
            {t.studentDashboard}
          </h1>
          <LanguageLogoutControls onLogout={handleLogout} />
        </div>
        
        <nav className="dashboard-nav">
          <button
            className={`nav-button ${currentView === 'enroll' ? 'active' : ''}`}
            onClick={() => handleViewChange('enroll')}
          >
            <span className="nav-icon">📚</span>
            {t.enrollCourses}
          </button>
          <button
            className={`nav-button ${currentView === 'content' ? 'active' : ''}`}
            onClick={() => handleViewChange('content')}
          >
            <span className="nav-icon">👁️</span>
            {t.viewContent}
          </button>
          <button
            className={`nav-button ${currentView === 'select' ? 'active' : ''}`}
            onClick={() => handleViewChange('select')}
          >
            <span className="nav-icon">✅</span>
            {t.selectCompleted}
          </button>
          <button
            className={`nav-button ${currentView === 'completed' ? 'active' : ''}`}
            onClick={() => handleViewChange('completed')}
          >
            <span className="nav-icon">🏆</span>
            {t.completedLessons}
          </button>
        </nav>
      </div>

      <div className="dashboard-content">
        {currentView === 'enroll' && (
          <EnrollCourse 
            onEnrollSuccess={handleEnrollSuccess}
            onLogout={handleLogout}
          />
        )}
        {currentView === 'content' && <ViewContent />}
        {currentView === 'select' && <SelectCompleted />}
        {currentView === 'completed' && <CompletedLessons />}
      </div>
    </div>
  );
};