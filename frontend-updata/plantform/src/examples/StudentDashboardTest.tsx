// src/examples/StudentDashboardTest.tsx
import React from 'react';
import { LanguageProvider } from '../contexts/LanguageContext';
import { StudentDashboard } from '../pages/student/StudentDashboard';

/**
 * مثال لاختبار لوحة الطالب مع نظام اللغات المحدث
 * Example for testing updated student dashboard with multilingual system
 */
export const StudentDashboardTest: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <LanguageProvider>
        <StudentDashboard />
      </LanguageProvider>
    </div>
  );
};

export default StudentDashboardTest;