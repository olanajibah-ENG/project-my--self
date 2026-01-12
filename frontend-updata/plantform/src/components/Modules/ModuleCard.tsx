// src/components/Modules/ModuleCard.tsx

import React, { useState } from 'react';
import type { Module } from '../../types/module.types';
import { useLanguage } from '../../contexts/LanguageContext';
import './ModuleCard.css';

interface Props {
  module: Module;
  courseName: string;
  onEdit: (module: Module) => void;
  onDelete: (moduleId: number) => Promise<void>;
}

export const ModuleCard: React.FC<Props> = ({
  module,
  courseName,
  onEdit,
  onDelete,
}) => {
  const { t } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const playSound = () => {
    const audio = new Audio(
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OihUBELTqjj8bllHAU2jdXwyXcsBS2A0PLaizsKG2m98OmiURAMUKXh8bllHAU3jtbwyXYrBSuCz/HajDkIG2i76+ifTxALTqfi8LdlGwU5j9XwxnQpBSqBzvHaizsIHGm87+mjURAMUKXh8bhlHQY5j9TwyHMrBSqBz/HajDgIG2m87+mjTxALT6Xi8L'
    );
    audio.play().catch(() => {});
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    playSound();

    try {
      await onDelete(module.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting module:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const lessonsCount = module.lessons ? module.lessons.length : 0;
  const progress = lessonsCount > 0 ? (lessonsCount / 10) * 100 : 0;

  const getLessonsText = (count: number) => {
    if (count === 0) return `0 ${t.modules.lessons}`;
    if (count === 1) return `1 ${t.modules.lesson}`;
    return `${count} ${t.modules.lessons}`;
  };

  return (
    <div className="module-card">
      <div className="module-card-header">
        <h3 className="module-title">📦 {module.title}</h3>
        <span className="module-order">#{module.order}</span>
      </div>

      <p className="module-description">{module.description}</p>

      <div className="module-meta">
        <div className="meta-item">
          <span className="meta-icon">📚</span>
          <span className="meta-text">{courseName}</span>
        </div>
        <div className="meta-item">
          <span className="meta-icon">📖</span>
          <span className="meta-text">{getLessonsText(lessonsCount)}</span>
        </div>
      </div>

      {lessonsCount > 0 && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-text">{progress.toFixed(0)}% {t.modules.complete}</span>
        </div>
      )}

      {showDeleteConfirm ? (
        <div className="delete-confirmation">
          <p className="delete-message">
            {t.modules.areYouSure}
          </p>
          <div className="confirmation-actions">
            <button
              className="btn-confirm btn-cancel"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              {t.modules.keepIt}
            </button>
            <button
              className="btn-confirm btn-delete"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? t.modules.deleting : t.modules.yesDelete}
            </button>
          </div>
        </div>
      ) : (
        <div className="module-actions">
          <button
            className="action-btn edit-btn"
            onClick={() => {
              playSound();
              onEdit(module);
            }}
            title={t.common.edit}
          >
            ✏️ {t.common.edit}
          </button>
          <button
            className="action-btn delete-btn"
            onClick={() => {
              playSound();
              setShowDeleteConfirm(true);
            }}
            title={t.common.delete}
          >
            🗑️ {t.common.delete}
          </button>
        </div>
      )}
    </div>
  );
};
