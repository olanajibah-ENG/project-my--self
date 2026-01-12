// src/components/Courses/CourseCard.tsx

import React, { useState } from 'react';
import type { Course } from '../../types/course.types';
import { useLanguage } from '../../contexts/LanguageContext';
import './CourseCard.css';

interface Props {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (id: number) => void;
}

export const CourseCard: React.FC<Props> = ({ course, onEdit, onDelete }) => {
  const { t, isRTL } = useLanguage();
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const playSound = () => {
    const audio = new Audio(
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OihUBELTqjj8bllHAU2jdXwyXcsBS2A0PLaizsKG2m98OmiURAMUKXh8bllHAU3jtbwyXYrBSuCz/HajDkIG2i76+ifTxALTqfi8LdlGwU5j9XwxnQpBSqBzvHaizsIHGm87emhURARTqXg8LZkHAU4j9TwyHUrBSuBzvLajDcIGmi87+mjVBAMUKXg8bhlHQY5j9TwyHMrBSqBz/HajDgIG2m87+mjTxALT6Xi8L'
    );
    audio.play().catch(() => {});
  };

  const handleEdit = () => {
    playSound();
    onEdit(course);
  };

  const handleDelete = async () => {
    if (window.confirm(t.courses.messages.deleteConfirm)) {
      setIsDeleting(true);
      playSound();
      try {
        await onDelete(course.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className={`course-card ${isDeleting ? 'deleting' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="card-watermark">📚</div>

      <div className="card-header">
        <div className="card-icon">🎓</div>
        <div className="card-badge">
          {course.modules?.length || 0} {t.courses.moduleCount}
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-title">{course.title}</h3>
        <p className="card-description">{course.description}</p>

        <div className="card-meta">
          <div className="meta-item">
            <span className="meta-icon">👨‍🏫</span>
            <span className="meta-text">{course.instructor}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">📅</span>
            <span className="meta-text">{formatDate(course.created_at)}</span>
          </div>
        </div>
      </div>

      <div className={`card-actions ${showActions ? 'visible' : ''}`}>
        <button
          className="action-btn edit-btn"
          onClick={handleEdit}
          title={t.common.edit}
        >
          <span className="btn-icon">✏️</span>
          <span className="btn-text">{t.common.edit}</span>
        </button>
        <button
          className="action-btn delete-btn"
          onClick={handleDelete}
          disabled={isDeleting}
          title={t.common.delete}
        >
          <span className="btn-icon">🗑️</span>
          <span className="btn-text">
            {isDeleting ? t.courses.deleting : t.common.delete}
          </span>
        </button>
      </div>

      {course.modules && course.modules.length > 0 && (
        <div className="card-footer">
          <div className="lessons-count">
            📖 {course.modules.length} {t.courses.moduleCount}
          </div>
        </div>
      )}
    </div>
  );
};