// src/examples/StudentDashboardExample.tsx
import React from 'react';
import { LanguageProvider } from '../contexts/LanguageContext';
import { StudentDashboard } from '../components/Student/StudentDashboard';

/**
 * مثال لاستخدام لوحة الطالب مع نظام اللغات المتعددة
 * Example of using Student Dashboard with multilingual system
 */
export const StudentDashboardExample: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <LanguageProvider>
        <StudentDashboard />
      </LanguageProvider>
    </div>
  );
};

// مثال لاستخدام المكونات منفردة
// Example of using individual components
export const IndividualComponentsExample: React.FC = () => {
  return (
    <LanguageProvider>
      <div style={{ padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* استيراد المكونات */}
        {/* Import components */}
        {/* 
        <LanguageToggle />
        <LogoutButton onLogout={() => alert('Logged out!')} />
        <LanguageLogoutControls onLogout={() => alert('Logged out!')} />
        */}
      </div>
    </LanguageProvider>
  );
};

export default StudentDashboardExample;