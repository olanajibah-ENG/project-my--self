import React, { useState, useEffect } from 'react';
import type { Book, BookFormData } from '../../types/book.types';
import './BookModal.css';

interface EditBookModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onSubmit: (id: number, bookData: Partial<BookFormData>) => Promise<void>;
  isLoading: boolean;
}

export const EditBookModal: React.FC<EditBookModalProps> = ({
  isOpen,
  book,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    cover_image: '',
    quantity: 1
  });

  const [errors, setErrors] = useState<Partial<BookFormData>>({});

  useEffect(() => {
    if (book && isOpen) {
      setFormData({
        title: book.title,
        author: book.author,
        cover_image: book.cover_image || '',
        quantity: book.quantity
      });
      setErrors({});
    }
  }, [book, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity'
        ? value ? Number(value) : undefined
        : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof BookFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    }

    const quantity = Number(formData.quantity);
    if (quantity < 1 || isNaN(quantity)) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!book || !validateForm()) {
      return;
    }

    try {
      await onSubmit(book.id, formData);
      onClose();
    } catch (error) {
      // Error is handled by the parent component
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen || !book) return null;

  return (
    <div className="book-modal-overlay" onClick={handleClose}>
      <div className="book-modal" onClick={(e) => e.stopPropagation()}>
        <div className="book-modal-header">
          <h2>Edit Book</h2>
          <button className="book-modal-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="book-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                placeholder="Enter book title"
                required
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="author">Author *</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className={errors.author ? 'error' : ''}
                placeholder="Enter author name"
                required
              />
              {errors.author && <span className="error-message">{errors.author}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className={errors.quantity ? 'error' : ''}
                min="1"
                placeholder="Enter quantity"
                required
              />
              {errors.quantity && <span className="error-message">{errors.quantity}</span>}
            </div>

            <div className="form-group full-width">
              <label htmlFor="cover_image">Cover Image URL</label>
              <input
                type="url"
                id="cover_image"
                name="cover_image"
                value={formData.cover_image}
                onChange={handleInputChange}
                placeholder="Enter cover image URL"
              />
            </div>

          </div>

          <div className="book-modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
