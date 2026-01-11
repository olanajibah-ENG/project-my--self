// src/components/Modules/ModuleFormModal.tsx

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Module } from '../../types/module.types';
import type { ModuleFormData } from '../../types/module.types';
import type { Course } from '../../types/course.types';
import './ModuleFormModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ModuleFormData) => Promise<void>;
  module?: Module | null;
  courses: Course[];
  mode: 'create' | 'edit';
}

export const ModuleFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  module,
  courses,
  mode,
}) => {
  const { t, isRTL } = useLanguage();
  const [formData, setFormData] = useState<ModuleFormData>({
    title: '',
    description: '',
    order: 1,
    course: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ModuleFormData, string>>>({});

  useEffect(() => {
    if (module && mode === 'edit') {
      setFormData({
        title: module.title,
        description: module.description,
        order: module.order,
        course: module.course,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        order: 1,
        course: courses.length > 0 ? courses[0].id : 0,
      });
    }
  }, [module, mode, isOpen, courses]);

  const playSound = () => {
    const audio = new Audio(
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OihUBELTqjj8bllHAU2jdXwyXcsBS2A0PLaizsKG2m98OmiURAMUKXh8bllHAU3jtbwyXYrBSuCz/HajDkIG2i76+ifTxALTqfi8LdlGwU5j9XwxnQpBSqBzvHaizsIHGm87emhURARTqXg8LZkHAU4j9TwyHUrBSuBzvLajDcIGmi87+mjVBAMUKXg8bhlHQY5j9TwyHMrBSqBz/HajDgIG2m87+mjTxALT6Xi8L'
    );
    audio.play().catch(() => {});
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ModuleFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = t.modules.form.titleRequired;
    } else if (formData.title.length < 3) {
      newErrors.title = t.modules.form.titleRequired;
    }

    if (!formData.description.trim()) {
      newErrors.description = t.modules.form.descriptionRequired;
    }

    if (formData.order < 1) {
      newErrors.order = t.modules.form.orderRequired;
    }

    if (!formData.course || formData.course === 0) {
      newErrors.course = t.modules.form.courseRequired;
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
      setFormData({ title: '', description: '', order: 1, course: 0 });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error submitting module:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const newValue =
      name === 'order' || name === 'course' ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name as keyof ModuleFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content module-modal ${isRTL ? 'rtl' : 'ltr'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'create'
              ? `✨ ${t.modules.createNew}`
              : `✏️ ${t.modal.edit} ${t.modules.title}`}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="module-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                📦 {t.modules.form.title}
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder={t.modules.form.titlePlaceholder}
              />
              {errors.title && (
                <span className="error-message">{errors.title}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="order" className="form-label">
                🔢 {t.modules.form.order}
              </label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className={`form-input ${errors.order ? 'error' : ''}`}
                min="1"
              />
              {errors.order && (
                <span className="error-message">{errors.order}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="course" className="form-label">
              📚 {t.modules.form.course}
            </label>
            <select
              id="course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className={`form-select ${errors.course ? 'error' : ''}`}
              disabled={mode === 'edit'}
            >
              <option value={0}>{t.modules.form.selectCourse}</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            {errors.course && (
              <span className="error-message">{errors.course}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              📝 {t.modules.form.description}
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`form-textarea ${
                errors.description ? 'error' : ''
              }`}
              placeholder={t.modules.form.descriptionPlaceholder}
              rows={4}
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
