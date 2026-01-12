// src/pages/student/StudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { EnrollCourse } from '../../components/Student/EnrollCourse';
import { ViewContent } from '../../components/Student/ViewContent';
import { SelectCompleted } from '../../components/Student/SelectCompleted';
import { CompletedLessons } from '../../components/Student/CompletedLessons';
import { LanguageToggleOnly } from '../../components/Student/LanguageToggleOnly';
import { StudentService } from '../../services/student.service.ts';
import { useLanguage } from '../../contexts/LanguageContext';
import { studentTranslations } from '../../locales/studentTranslations';
import './StudentDashboard.css';

type TabType = 'enroll' | 'view' | 'select' | 'completed';

export const StudentDashboard: React.FC = () => {
  const { language, isRTL } = useLanguage();
  const t = studentTranslations[language];
  const [activeTab, setActiveTab] = useState<TabType>('enroll');

  useEffect(() => {
    // تحقق من الـ Refresh Token عند تحميل الصفحة
    checkAndRefreshToken();
  }, []);

  const checkAndRefreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return;

    try {
      const response = await StudentService.refreshToken(refreshToken);
      localStorage.setItem('accessToken', response.access);
      console.log('✅ Token refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh token:', error);
      // يمكن إعادة التوجيه لصفحة تسجيل الدخول
      // window.location.href = '/login';
    }
  };

  const playSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OihUBELTqjj8bllHAU2jdXwyXcsBS2A0PLaizsKG2m98OmiURAMUKXh8bllHAU3jtbwyXYrBSuCz/HajDkIG2i76+ifTxALTqfi8LdlGwU5j9XwxnQpBSqBzvHaizsIHGm87emhURARTqXg8LZkHAU4j9TwyHUrBSuBzvLajDcIGmi87+mjVBAMUKXg8bhlHQY5j9TwyHMrBSqBz/HajDgIG2m87+mjTxALT6Xi8L');
    audio.play().catch(() => {});
  };

  const handleTabChange = (tab: TabType) => {
    playSound();
    setActiveTab(tab);
  };

  const handleLogout = () => {
    localStorage.removeItem('plantform-token');
    localStorage.removeItem('plantform-user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  return (
    <div className={`student-dashboard-container ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Sidebar */}
      <aside className="student-sidebar">
        <div className="student-sidebar-header">
          <div className="student-logo">
            <span className="student-logo-icon">🎓</span>
            <span className="student-logo-text">{t.studentDashboard}</span>
          </div>
          <div className="language-toggle-wrapper">
            <LanguageToggleOnly />
          </div>
        </div>

        <nav className="student-sidebar-nav">
          <button
            className={`student-nav-item ${activeTab === 'enroll' ? 'active' : ''}`}
            onClick={() => handleTabChange('enroll')}
          >
            <span className="student-nav-icon">✨</span>
            <span className="student-nav-text">{t.enrollCourses}</span>
            {activeTab === 'enroll' && <span className="student-nav-indicator"></span>}
          </button>

          <button
            className={`student-nav-item ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => handleTabChange('view')}
          >
            <span className="student-nav-icon">👁️</span>
            <span className="student-nav-text">{t.viewContent}</span>
            {activeTab === 'view' && <span className="student-nav-indicator"></span>}
          </button>

          <button
            className={`student-nav-item ${activeTab === 'select' ? 'active' : ''}`}
            onClick={() => handleTabChange('select')}
          >
            <span className="student-nav-icon">✅</span>
            <span className="student-nav-text">{t.selectCompleted}</span>
            {activeTab === 'select' && <span className="student-nav-indicator"></span>}
          </button>

          <button
            className={`student-nav-item ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => handleTabChange('completed')}
          >
            <span className="student-nav-icon">🎉</span>
            <span className="student-nav-text">{t.completedLessons}</span>
            {activeTab === 'completed' && <span className="student-nav-indicator"></span>}
          </button>
        </nav>

        <div className="student-sidebar-footer">
          <div className="student-user-info">
            <div className="student-user-avatar">👨‍🎓</div>
            <div className="student-user-details">
              <div className="student-user-name">{t.student}</div>
              <div className="student-user-role">Student</div>
            </div>
          </div>
          <button
            className="student-logout-button"
            onClick={handleLogout}
            title={t.logout}
          >
            <span className="logout-icon">🚪</span>
            <span className="logout-text">{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="student-dashboard-main">
        <div className="student-content-wrapper">
          {activeTab === 'enroll' && <EnrollCourse onEnrollSuccess={() => handleTabChange('view')} />}
          {activeTab === 'view' && <ViewContent />}
          {activeTab === 'select' && <SelectCompleted />}
          {activeTab === 'completed' && <CompletedLessons />}
        </div>
      </main>
    </div>
  );
};