// src/components/Courses/CourseFormModal.tsx

import React, { useState, useEffect } from 'react';
import type { Course, CourseFormData } from '../../types/course.types';
import { useLanguage } from '../../contexts/LanguageContext';
import './CourseFormModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CourseFormData) => Promise<void>;
  course?: Course | null;
  mode: 'create' | 'edit';
}

export const CourseFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  course,
  mode,
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CourseFormData, string>>>({});

  useEffect(() => {
    if (course && mode === 'edit') {
      setFormData({
        title: course.title,
        description: course.description,
      });
    } else {
      setFormData({ title: '', description: '' });
    }
  }, [course, mode, isOpen]);

  const playSound = () => {
    const audio = new Audio(
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OihUBELTqjj8bllHAU2jdXwyXcsBS2A0PLaizsKG2m98OmiURAMUKXh8bllHAU3jtbwyXYrBSuCz/HajDkIG2i76+ifTxALTqfi8LdlGwU5j9XwxnQpBSqBzvHaizsIHGm87emhURARTqXg8LZkHAU4j9TwyHUrBSuBzvLajDcIGmi87+mjVBAMUKXg8bhlHQY5j9TwyHMrBSqBz/HajDgIG2m87+mjTxALT6Xi8L'
    );
    audio.play().catch(() => {});
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CourseFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = t.courses.form.titleRequired;
    } else if (formData.title.length < 3) {
      newErrors.title = t.courses.form.titleTooShort;
    }

    if (!formData.description.trim()) {
      newErrors.description = t.courses.form.descriptionRequired;
    } else if (formData.description.length < 10) {
      newErrors.description = t.courses.form.descriptionTooShort;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      playSound();
      return;
    }

    setIsSubmitting(true);
    playSound();

    try {
      await onSubmit(formData);
      setFormData({ title: '', description: '' });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error submitting course:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CourseFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'create' ? `✨ ${t.modal.create} ${t.nav.courses}` : `✏️ ${t.modal.edit} ${t.nav.courses}`}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="course-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              📚 {t.courses.form.title}
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder={t.courses.form.titlePlaceholder}
            />
            {errors.title && (
              <span className="error-message">{errors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              📝 {t.courses.form.description}
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder={t.courses.form.descriptionPlaceholder}
              rows={5}
            />
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-cancel"
              disabled={isSubmitting}
            >
              ❌ {t.common.cancel}
            </button>
            <button
              type="submit"
              className="btn btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  {t.modal.saving}
                </>
              ) : (
                <>
                  {mode === 'create' ? `🚀 ${t.common.create}` : `💾 ${t.common.save}`}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
