// src/pages/student/StudentPage.tsx
import React from 'react';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { StudentDashboard } from './StudentDashboard';

export const StudentPage: React.FC = () => {
  return (
    <LanguageProvider>
      <StudentDashboard />
    </LanguageProvider>
  );
};