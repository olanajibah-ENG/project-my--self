// src/components/Courses/CoursesList.tsx

import React, { useState, useEffect } from 'react';
import { CourseCard } from './CourseCard';
import { CourseFormModal } from './CourseFormModal';
import { CourseService } from '../../services/course.service';
import { type Course, type CourseFormData } from '../../types/course.types';
import { useLanguage } from '../../contexts/LanguageContext';
import './CoursesList.css';

export const CoursesList: React.FC = () => {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const data = await CourseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
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
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (course: Course) => {
    setModalMode('edit');
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: CourseFormData) => {
    try {
      if (modalMode === 'create') {
        const newCourse = await CourseService.createCourse(formData);
        setCourses((prev) => [...prev, newCourse]);
        showSuccessMessage(t.courses.messages.created);
      } else if (selectedCourse) {
        const updatedCourse = await CourseService.updateCourse(
          selectedCourse.id,
          formData
        );
        setCourses((prev) =>
          prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c))
        );
        showSuccessMessage(t.courses.messages.updated);
      }
    } catch (error) {
      console.error('Error submitting course:', error);
      alert(t.courses.messages.error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await CourseService.deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      showSuccessMessage(t.courses.messages.deleted);
    } catch (error) {
      console.error('Error deleting course:', error);
      alert(t.courses.messages.error);
    }
  };

  if (isLoading) {
    return (
      <div className="courses-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">{t.common.loading} 📚</p>
      </div>
    );
  }

  return (
    <div className="courses-container">
      {/* Success Message */}
      {showSuccess && <div className="success-toast">{successMessage}</div>}

      {/* Header */}
      <div className="courses-header">
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-icon">📚</span>
            {t.courses.title}
          </h1>
          <p className="page-subtitle">
            {t.courses.subtitle}
          </p>
        </div>
        <button className="btn-create" onClick={handleCreateClick}>
          <span className="btn-sparkle">✨</span>
          <span>{t.courses.createNew}</span>
          <span className="btn-plus">+</span>
        </button>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3 className="empty-title">{t.courses.noCourses}</h3>
          <p className="empty-description">{t.courses.noCoursesDesc}</p>
          <button className="btn-empty-action" onClick={handleCreateClick}>
            🚀 {t.courses.createAction}
          </button>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <CourseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        course={selectedCourse}
        mode={modalMode}
      />
    </div>
  );
};
