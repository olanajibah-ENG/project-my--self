// src/pages/instructor/InstructorDashboard.tsx

import React, { useState } from 'react';
import { CoursesList } from '../../components/Courses/CoursesList';
import { ModulesList } from '../../components/Modules/ModulesList';
import { LessonsList } from '../../components/Lessons/LessonsList';
import { LanguageToggle } from '../../components/LanguageToggle/LanguageToggle';
import { useLanguage } from '../../contexts/LanguageContext';
import './InstructorDashboard.css';

type TabType = 'courses' | 'modules' | 'lessons';

interface Props {
  onLogout: () => void;
}

export const InstructorDashboard: React.FC<Props> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('courses');
  const { t, isRTL } = useLanguage();

  const playSound = () => {
    const audio = new Audio(
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OihUBELTqjj8bllHAU2jdXwyXcsBS2A0PLaizsKG2m98OmiURAMUKXh8bllHAU3jtbwyXYrBSuCz/HajDkIG2i76+ifTxALTqfi8LdlGwU5j9XwxnQpBSqBzvHaizsIHGm87emhURARTqXg8LZkHAU4j9TwyHUrBSuBzvLajDcIGmi87+mjVBAMUKXg8bhlHQY5j9TwyHMrBSqBz/HajDgIG2m87+mjTxALT6Xi8L'
    );
    audio.play().catch(() => {});
  };

  const handleTabChange = (tab: TabType) => {
    playSound();
    setActiveTab(tab);
  };

  return (
    <div className={`dashboard-container ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🎓</span>
            <span className="logo-text">{t.nav.dashboard}</span>
          </div>
          <div className="language-toggle-wrapper">
            <LanguageToggle />
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => handleTabChange('courses')}
          >
            <span className="nav-icon">📚</span>
            <span className="nav-text">{t.nav.courses}</span>
            {activeTab === 'courses' && <span className="nav-indicator"></span>}
          </button>

          <button
            className={`nav-item ${activeTab === 'modules' ? 'active' : ''}`}
            onClick={() => handleTabChange('modules')}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-text">{t.nav.modules}</span>
            {activeTab === 'modules' && <span className="nav-indicator"></span>}
          </button>

          <button
            className={`nav-item ${activeTab === 'lessons' ? 'active' : ''}`}
            onClick={() => handleTabChange('lessons')}
          >
            <span className="nav-icon">📖</span>
            <span className="nav-text">{t.nav.lessons}</span>
            {activeTab === 'lessons' && <span className="nav-indicator"></span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">👨‍🏫</div>
            <div className="user-details">
              <div className="user-name">{t.dashboard.instructor}</div>
              <div className="user-role">Instructor</div>
            </div>
          </div>
          <button 
            className="btn-logout"
            onClick={() => {
              playSound();
              onLogout();
            }}
            title={t.nav.logout}
          >
            <span className="logout-icon">🚪</span>
            <span className="logout-text">{t.nav.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="content-wrapper">
          {activeTab === 'courses' && <CoursesList />}

          {activeTab === 'modules' && <ModulesList />}

          {activeTab === 'lessons' && <LessonsList />}
        </div>
      </main>
    </div>
  );
};
