// src/components/Student/ViewContent.tsx
import React, { useState, useEffect } from 'react';
import { ModuleService } from '../../services/module.service.ts';
import { LessonService } from '../../services/lesson.service.ts';
import type { Module } from '../../types/module.types';
import type { Lesson } from '../../types/lesson.types';
import { MarkdownViewer } from '../Lessons/MarkdownViewer';
import { VideoViewer } from '../Lessons/VideoViewer';
import { useLanguage } from '../../contexts/LanguageContext';
import { studentTranslations } from '../../locales/studentTranslations';
import './ViewContent.css';

type ViewMode = 'modules' | 'lessons' | 'markdown' | 'videos';

export const ViewContent: React.FC = () => {
  const { language, isRTL } = useLanguage();
  const t = studentTranslations[language];
  const [viewMode, setViewMode] = useState<ViewMode>('modules');
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // For Markdown/Video viewers
  const [isMarkdownOpen, setIsMarkdownOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    loadContent();
  }, [viewMode]);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      if (viewMode === 'modules') {
        const data = await ModuleService.getAllModules();
        setModules(data.results);
      } else if (viewMode === 'lessons' || viewMode === 'markdown' || viewMode === 'videos') {
        const data = await LessonService.getAllLessons();
        setLessons(data.results);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const playSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OihUBELTqjj8bllHAU2jdXwyXcsBS2A0PLaizsKG2m98OmiURAMUKXh8bllHAU3jtbwyXYrBSuCz/HajDkIG2i76+ifTxALTqfi8LdlGwU5j9XwxnQpBSqBzvHaizsIHGm87emhURARTqXg8LZkHAU4j9TwyHUrBSuBzvLajDcIGmi87+mjVBAMUKXg8bhlHQY5j9TwyHMrBSqBz/HajDgIG2m87+mjTxALT6Xi8L');
    audio.play().catch(() => {});
  };

  const handleViewModeChange = (mode: ViewMode) => {
    playSound();
    setViewMode(mode);
  };

  const handleViewMarkdown = (lesson: Lesson) => {
    playSound();
    setSelectedLesson(lesson);
    setIsMarkdownOpen(true);
  };

  const handleViewVideo = (lesson: Lesson) => {
    playSound();
    setSelectedLesson(lesson);
    setIsVideoOpen(true);
  };

  return (
    <div className={`view-content-container ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="view-header">
        <h2 className="view-title">
          <span className="title-icon">👁️</span>
          {t.contentView}
        </h2>
        <div className="view-tabs">
          <button
            className={`view-tab ${viewMode === 'modules' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('modules')}
          >
            <span>📦</span>
            {t.modules}
          </button>
          <button
            className={`view-tab ${viewMode === 'lessons' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('lessons')}
          >
            <span>📖</span>
            {t.lessons}
          </button>
          <button
            className={`view-tab ${viewMode === 'markdown' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('markdown')}
          >
            <span>📝</span>
            {t.markdown}
          </button>
          <button
            className={`view-tab ${viewMode === 'videos' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('videos')}
          >
            <span>🎥</span>
            {t.videos}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="view-loading">
          <div className="loading-spinner"></div>
          <p>{t.loading}</p>
        </div>
      ) : (
        <div className="view-results">
          {viewMode === 'modules' && (
            <div className="modules-list">
              {modules.map((module) => (
                <div key={module.id} className="content-card module-card">
                  <div className="card-watermark">📦</div>
                  <div className="card-icon">📦</div>
                  <h3 className="card-title">{module.title}</h3>
                  <p className="card-description">{module.description}</p>
                  <div className="card-meta">
                    <span>🔢 {t.order}: {module.order}</span>
                    <span>📖 {module.lessons?.length || 0} {t.lesson}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'lessons' && (
            <div className="lessons-list">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="content-card lesson-card">
                  <div className="card-watermark">📖</div>
                  <div className="card-icon">📖</div>
                  <h3 className="card-title">{lesson.title}</h3>
                  <div className="card-meta">
                    <span>🔢 {t.order}: {lesson.order}</span>
                    {lesson.video_file && <span>🎥 {t.video}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'markdown' && (
            <div className="markdown-list">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="content-card markdown-card">
                  <div className="card-watermark">📝</div>
                  <div className="card-icon">📝</div>
                  <h3 className="card-title">{lesson.title}</h3>
                  <button
                    className="btn-view-markdown"
                    onClick={() => handleViewMarkdown(lesson)}
                  >
                    <span>👁️</span>
                    {t.viewContent}
                  </button>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'videos' && (
            <div className="videos-list">
              {lessons.filter(l => l.video_file).map((lesson) => (
                <div key={lesson.id} className="content-card video-card">
                  <div className="card-watermark">🎥</div>
                  <div className="card-icon">🎥</div>
                  <h3 className="card-title">{lesson.title}</h3>
                  <button
                    className="btn-view-video"
                    onClick={() => handleViewVideo(lesson)}
                  >
                    <span>▶️</span>
                    {t.playVideo}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedLesson && (
        <>
          <MarkdownViewer
            isOpen={isMarkdownOpen}
            onClose={() => setIsMarkdownOpen(false)}
            lessonId={selectedLesson.id}
            lessonTitle={selectedLesson.title}
          />
          <VideoViewer
            isOpen={isVideoOpen}
            onClose={() => setIsVideoOpen(false)}
            lessonId={selectedLesson.id}
            lessonTitle={selectedLesson.title}
          />
        </>
      )}
    </div>
  );
};