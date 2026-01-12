// src/components/Lessons/LessonsList.tsx
import React, { useState, useEffect } from 'react';
import { LessonCard } from './LessonCard';
import { LessonFormModal } from './LessonFormModal';
import { MarkdownViewer } from './MarkdownViewer';
import { VideoViewer } from './VideoViewer';
import { LessonService } from '../../services/lesson.service';
import { ModuleService } from '../../services/module.service';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Lesson, LessonFormData } from '../../types/lesson.types';
import type { Module } from '../../types/module.types';
import './LessonsList.css';

export const LessonsList: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Markdown & Video Viewers
  const [isMarkdownOpen, setIsMarkdownOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [viewLesson, setViewLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [lessonsData, modulesData] = await Promise.all([
        LessonService.getAllLessons(),
        ModuleService.getAllModules()
      ]);
      setLessons(lessonsData.results);
      setModules(modulesData.results);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCreateClick = () => {
    setModalMode('create');
    setSelectedLesson(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (lesson: Lesson) => {
    setModalMode('edit');
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: LessonFormData) => {
    try {
      if (modalMode === 'create') {
        const newLesson = await LessonService.createLesson(formData);
        setLessons(prev => [...prev, newLesson]);
        showSuccessMessage(t.lessons.messages.created);
      } else if (selectedLesson) {
        const updatedLesson = await LessonService.updateLesson(
          selectedLesson.id,
          formData
        );
        setLessons(prev =>
          prev.map(l => (l.id === updatedLesson.id ? updatedLesson : l))
        );
        showSuccessMessage(t.lessons.messages.updated);
      }
    } catch (error) {
      console.error('Error submitting lesson:', error);
      alert(`❌ ${t.common.error}`);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await LessonService.deleteLesson(id);
      setLessons(prev => prev.filter(l => l.id !== id));
      showSuccessMessage(t.lessons.messages.deleted);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert(`❌ ${t.common.error}`);
    }
  };

  const handleViewMarkdown = (lesson: Lesson) => {
    setViewLesson(lesson);
    setIsMarkdownOpen(true);
  };

  const handleViewVideo = (lesson: Lesson) => {
    setViewLesson(lesson);
    setIsVideoOpen(true);
  };

  const getModuleName = (moduleId: number) => {
    return modules.find(m => m.id === moduleId)?.title || '';
  };

  if (isLoading) {
    return (
      <div className="lessons-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">{t.common.loading} 📖</p>
      </div>
    );
  }

  return (
    <div className={`lessons-container ${isRTL ? 'rtl' : 'ltr'}`}>
      {showSuccess && (
        <div className="success-toast">
          {successMessage}
        </div>
      )}

      <div className="lessons-header">
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-icon">📖</span>
            {t.lessons.title}
          </h1>
          <p className="page-subtitle">
            {t.lessons.subtitle}
          </p>
        </div>
        <button className="btn-create" onClick={handleCreateClick}>
          <span className="btn-sparkle">✨</span>
          <span>{t.lessons.createNew}</span>
          <span className="btn-plus">+</span>
        </button>
      </div>

      <div className="lessons-stats">
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <div className="stat-value">{lessons.length}</div>
            <div className="stat-label">{t.dashboard.stats.lessons}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{modules.length}</div>
            <div className="stat-label">{t.dashboard.stats.modules}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎥</div>
          <div className="stat-content">
            <div className="stat-value">{lessons.filter(l => l.video_file).length}</div>
            <div className="stat-label">{t.dashboard.stats.videos}</div>
          </div>
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3 className="empty-title">{t.lessons.noLessons}</h3>
          <p className="empty-description">{t.lessons.noLessonsDesc}</p>
          <button className="btn-empty-action" onClick={handleCreateClick}>
            🚀 {t.common.create}
          </button>
        </div>
      ) : (
        <div className="lessons-grid">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              moduleName={getModuleName(lesson.module)}
              onEdit={handleEditClick}
              onDelete={handleDelete}
              onViewMarkdown={handleViewMarkdown}
              onViewVideo={handleViewVideo}
            />
          ))}
        </div>
      )}

      <LessonFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        lesson={selectedLesson}
        modules={modules}
        mode={modalMode}
      />

      {viewLesson && (
        <>
          <MarkdownViewer
            isOpen={isMarkdownOpen}
            onClose={() => setIsMarkdownOpen(false)}
            lessonId={viewLesson.id}
            lessonTitle={viewLesson.title}
          />
          <VideoViewer
            isOpen={isVideoOpen}
            onClose={() => setIsVideoOpen(false)}
            lessonId={viewLesson.id}
            lessonTitle={viewLesson.title}
          />
        </>
      )}
    </div>
  );
};