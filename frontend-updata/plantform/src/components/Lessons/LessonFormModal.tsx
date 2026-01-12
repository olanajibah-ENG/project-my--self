// src/components/Lessons/LessonFormModal.tsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Lesson, LessonFormData } from '../../types/lesson.types';
import type { Module } from '../../types/module.types';
import './LessonFormModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LessonFormData) => Promise<void>;
  lesson?: Lesson | null;
  modules: Module[];
  mode: 'create' | 'edit';
}

export const LessonFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  lesson,
  modules,
  mode,
}) => {
  const { t, isRTL } = useLanguage();
  const [formData, setFormData] = useState<LessonFormData>({
    title: '',
    content_markdown: '',
    order: 1,
    module: 0,
    video_file: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LessonFormData, string>>>({});
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    if (lesson && mode === 'edit') {
      setFormData({
        title: lesson.title,
        content_markdown: lesson.content_markdown,
        order: lesson.order,
        module: lesson.module,
        video_file: null,
      });
      setFileName('');
    } else {
      setFormData({
        title: '',
        content_markdown: '',
        order: 1,
        module: modules.length > 0 ? modules[0].id : 0,
        video_file: null,
      });
      setFileName('');
    }
  }, [lesson, mode, isOpen, modules]);

  const playSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OihUBELTqjj8bllHAU2jdXwyXcsBS2A0PLaizsKG2m98OmiURAMUKXh8bllHAU3jtbwyXYrBSuCz/HajDkIG2i76+ifTxALTqfi8LdlGwU5j9XwxnQpBSqBzvHaizsIHGm87emhURARTqXg8LZkHAU4j9TwyHUrBSuBzvLajDcIGmi87+mjVBAMUKXg8bhlHQY5j9TwyHMrBSqBz/HajDgIG2m87+mjTxALT6Xi8L');
    audio.play().catch(() => {});
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof LessonFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = t.lessons.form.titleRequired;
    }

    if (!formData.content_markdown.trim()) {
      newErrors.content_markdown = t.lessons.form.contentRequired;
    }

    if (formData.order < 1) {
      newErrors.order = t.lessons.form.orderRequired;
    }

    if (!formData.module || formData.module === 0) {
      newErrors.module = t.lessons.form.moduleRequired;
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
      setFormData({ title: '', content_markdown: '', order: 1, module: 0, video_file: null });
      setFileName('');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error submitting lesson:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newValue = name === 'order' || name === 'module' ? Number(value) : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    if (errors[name as keyof LessonFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, video_file: file }));
    setFileName(file?.name || '');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content lesson-modal ${isRTL ? 'rtl' : 'ltr'}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'create' ? `✨ ${t.lessons.createNew}` : `✏️ ${t.modal.edit} ${t.lessons.title}`}
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="lesson-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title" className="form-label">📖 {t.lessons.form.title}</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder={t.lessons.form.titlePlaceholder}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="order" className="form-label">🔢 {t.lessons.form.order}</label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className={`form-input ${errors.order ? 'error' : ''}`}
                min="1"
              />
              {errors.order && <span className="error-message">{errors.order}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="module" className="form-label">📦 {t.lessons.form.module}</label>
            <select
              id="module"
              name="module"
              value={formData.module}
              onChange={handleChange}
              className={`form-select ${errors.module ? 'error' : ''}`}
              disabled={mode === 'edit'}
            >
              <option value={0}>{t.lessons.form.selectModule}</option>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
            {errors.module && <span className="error-message">{errors.module}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="content_markdown" className="form-label">📝 {t.lessons.form.content}</label>
            <textarea
              id="content_markdown"
              name="content_markdown"
              value={formData.content_markdown}
              onChange={handleChange}
              className={`form-textarea ${errors.content_markdown ? 'error' : ''}`}
              placeholder={t.lessons.form.contentPlaceholder}
              rows={8}
            />
            {errors.content_markdown && <span className="error-message">{errors.content_markdown}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="video_file" className="form-label">🎥 {t.lessons.form.videoFile}</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="video_file"
                name="video_file"
                accept="video/*"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="video_file" className="file-label">
                <span className="file-icon">📁</span>
                <span className="file-text">{fileName || t.lessons.form.selectVideo}</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-cancel" disabled={isSubmitting}>
              ❌ {t.common.cancel}
            </button>
            <button type="submit" className="btn btn-submit" disabled={isSubmitting}>
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