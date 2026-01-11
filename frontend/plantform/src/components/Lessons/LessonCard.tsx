// src/components/Lessons/LessonCard.tsx
import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Lesson } from '../../types/lesson.types';
import './LessonCard.css';

interface Props {
  lesson: Lesson;
  moduleName?: string;
  onEdit: (lesson: Lesson) => void;
  onDelete: (id: number) => void;
  onViewMarkdown: (lesson: Lesson) => void;
  onViewVideo: (lesson: Lesson) => void;
}

export const LessonCard: React.FC<Props> = ({
  lesson,
  moduleName,
  onEdit,
  onDelete,
  onViewMarkdown,
  onViewVideo
}) => {
  const { t } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);

  const playSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OihUBELTqjj8bllHAU2jdXwyXcsBS2A0PLaizsKG2m98OmiURAMUKXh8bllHAU3jtbwyXYrBSuCz/HajDkIG2i76+ifTxALTqfi8LdlGwU5j9XwxnQpBSqBzvHaizsIHGm87emhURARTqXg8LZkHAU4j9TwyHUrBSuBzvLajDcIGmi87+mjVBAMUKXg8bhlHQY5j9TwyHMrBSqBz/HajDgIG2m87+mjTxALT6Xi8L');
    audio.play().catch(() => {});
  };

  const handleEdit = () => {
    playSound();
    onEdit(lesson);
  };

  const handleDelete = async () => {
    if (window.confirm(t.lessons.messages.deleteConfirm)) {
      setIsDeleting(true);
      playSound();
      try {
        await onDelete(lesson.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleViewMarkdown = () => {
    playSound();
    onViewMarkdown(lesson);
  };

  const handleViewVideo = () => {
    playSound();
    onViewVideo(lesson);
  };

  return (
    <div className={`lesson-card ${isDeleting ? 'deleting' : ''}`}>
      <div className="lesson-watermark">📖</div>
      
      <div className="lesson-header">
        <div className="lesson-icon">📖</div>
        <div className="lesson-order">#{lesson.order}</div>
      </div>

      <div className="lesson-body">
        <h3 className="lesson-title">{lesson.title}</h3>
        <div className="lesson-meta">
          {moduleName && (
            <div className="meta-item">
              <span className="meta-icon">📦</span>
              <span className="meta-text">{moduleName}</span>
            </div>
          )}
          <div className="meta-item">
            <span className="meta-icon">📝</span>
            <span className="meta-text">{t.lessons.viewContent}</span>
          </div>
          {lesson.video_file && (
            <div className="meta-item">
              <span className="meta-icon">🎥</span>
              <span className="meta-text">{t.lessons.viewVideo}</span>
            </div>
          )}
        </div>
      </div>

      <div className="lesson-actions-grid">
        <button 
          className="action-btn-icon markdown-btn" 
          onClick={handleViewMarkdown}
          title={t.lessons.viewContent}
        >
          📝
        </button>
        
        {lesson.video_file && (
          <button 
            className="action-btn-icon video-btn" 
            onClick={handleViewVideo}
            title={t.lessons.viewVideo}
          >
            🎥
          </button>
        )}
        
        <button 
          className="action-btn-icon edit-btn" 
          onClick={handleEdit}
          title={t.common.edit}
        >
          ✏️
        </button>
        
        <button 
          className="action-btn-icon delete-btn" 
          onClick={handleDelete}
          disabled={isDeleting}
          title={t.common.delete}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};