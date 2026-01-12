// src/components/Modules/ModulesList.tsx

import React, { useEffect, useState } from 'react';
import { ModuleService } from '../../services/module.service';
import { CourseService } from '../../services/course.service';
import { type Module, type ModuleFormData } from '../../types/module.types';
import type { Course } from '../../types/course.types';
import { ModuleFormModal } from './ModuleFormModal';
import { ModuleCard } from './ModuleCard';
import { debugAuth, checkAuthStatus } from '../../utils/authDebug';
import { useLanguage } from '../../contexts/LanguageContext';
import './ModulesList.css';

export const ModulesList: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadModules = async () => {
    try {
      setIsLoading(true);
      const response = await ModuleService.getAllModules();
      setModules(response.results || []);
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await CourseService.getAllCourses();
      setCourses(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  useEffect(() => {
    // تشخيص المصادقة عند تحميل المكون
    debugAuth();
    
    loadModules();
    loadCourses();
  }, []);

  const playSound = () => {
    const audio = new Audio(
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OihUBELTqjj8bllHAU2jdXwyXcsBS2A0PLaizsKG2m98OmiURAMUKXh8bllHAU3jtbwyXYrBSuCz/HajDkIG2i76+ifTxALTqfi8LdlGwU5j9XwxnQpBSqBzvHaizsIHGm87+mjURAMUKXh8bhlHQY5j9TwyHMrBSqBz/HajDgIG2m87+mjTxALT6Xi8L'
    );
    audio.play().catch(() => {});
  };

  const handleOpenCreateModal = () => {
    // التحقق من المصادقة قبل فتح النموذج
    if (!checkAuthStatus()) {
      alert(`❌ Authentication required`);
      return;
    }
    
    setModalMode('create');
    setSelectedModule(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (module: Module) => {
    setModalMode('edit');
    setSelectedModule(module);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedModule(null);
  };

  const handleFormSubmit = async (data: ModuleFormData) => {
    console.log('🚀 Form submitted with data:', data);
    
    // التحقق من وجود التوكن
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Token exists:', !!token);
    
    if (!token) {
      alert(`❌ ${t.modules.messages.deleteConfirm}`);
      return;
    }
    
    try {
      if (modalMode === 'create') {
        console.log('📝 Creating module...');
        await ModuleService.createModule(data);
        setSuccessMessage(t.modules.messages.created);
      } else if (selectedModule) {
        console.log('✏️ Updating module...');
        await ModuleService.updateModule(selectedModule.id, data);
        setSuccessMessage(t.modules.messages.updated);
      }

      setShowSuccess(true);
      playSound();
      setTimeout(() => setShowSuccess(false), 3000);
      await loadModules();
    } catch (error: any) {
      console.error('❌ Error submitting form:', error);
      
      // معالجة أخطاء مختلفة
      if (error.response?.status === 403) {
        alert(`❌ Access forbidden - insufficient permissions`);
      } else if (error.response?.status === 401) {
        alert(`❌ Authentication expired - please login again`);
        localStorage.removeItem('accessToken');
        window.location.href = '/auth';
      } else if (error.response?.status === 500) {
        alert(`❌ ${t.common.error}`);
      } else {
        alert(`❌ ${t.common.error}`);
      }
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    try {
      await ModuleService.deleteModule(moduleId);
      setSuccessMessage(t.modules.messages.deleted);
      setShowSuccess(true);
      playSound();
      setTimeout(() => setShowSuccess(false), 3000);
      await loadModules();
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };

  const getCourseName = (courseId: number): string => {
    const course = courses.find((c) => c.id === courseId);
    return course ? course.title : 'Unknown Course';
  };

  const stats = {
    modules: modules.length,
    courses: courses.length,
    lessons: modules.reduce(
      (sum, m) => sum + (m.lessons?.length || 0),
      0
    ),
  };

  if (isLoading) {
    return (
      <div className="modules-loading">
        <div className="spinner-large"></div>
        <p>{t.common.loading} 📦</p>
      </div>
    );
  }

  return (
    <div className={`modules-container ${isRTL ? 'rtl' : 'ltr'}`}>
      {showSuccess && (
        <div className="success-toast">
          <span>{successMessage}</span>
        </div>
      )}

      <div className="modules-header">
        <div className="header-content">
          <h1 className="modules-title">📚 {t.modules.title}</h1>
          <p className="modules-subtitle">
            {t.modules.subtitle}
          </p>
        </div>
        <button className="btn-create-module" onClick={handleOpenCreateModal}>
          <span>✨</span>
          {t.modules.createNew}
        </button>
      </div>

      <div className="modules-stats">
        <div className="stat-card">
          <span className="stat-icon">📦</span>
          <div className="stat-content">
            <p className="stat-value">{stats.modules}</p>
            <p className="stat-label">{t.dashboard.stats.modules}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📚</span>
          <div className="stat-content">
            <p className="stat-value">{stats.courses}</p>
            <p className="stat-label">{t.dashboard.stats.courses}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📖</span>
          <div className="stat-content">
            <p className="stat-value">{stats.lessons}</p>
            <p className="stat-label">{t.dashboard.stats.lessons}</p>
          </div>
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h2>{t.modules.noModules}</h2>
          <p>{t.modules.noModulesDesc}</p>
          <button
            className="btn-create-module"
            onClick={handleOpenCreateModal}
          >
            <span>✨</span>
            {t.common.create}
          </button>
        </div>
      ) : (
        <div className="modules-grid">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              courseName={getCourseName(module.course)}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteModule}
            />
          ))}
        </div>
      )}

      <ModuleFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        module={selectedModule}
        courses={courses}
        mode={modalMode}
      />
    </div>
  );
};
