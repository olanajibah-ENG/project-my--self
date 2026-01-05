// =============================================================================
// 📚 EDIT BOOK MODAL - Form for updating existing books
// =============================================================================
// 
// ⚠️ ISSUE FOUND: Same as AddBookModal - cover_image was using type="url"
// ✅ FIX: Changed to type="file" for proper file uploads
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
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
  const [formData, setFormData] = useState<{
    title: string;
    author: string;
    quantity: number;
  }>({
    title: '',
    author: '',
    quantity: 1
  });

  // ✅ Separate state for the file
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (book && isOpen) {
      setFormData({
        title: book.title,
        author: book.author,
        quantity: book.quantity
      });
      // Show existing image if available
      setImagePreview(book.cover_image || null);
      setCoverImage(null);  // Reset file selection
      setErrors({});
    }
  }, [book, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? (value ? Number(value) : 1) : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, cover_image: 'Please select an image file' }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, cover_image: 'Image must be less than 5MB' }));
        return;
      }

      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, cover_image: '' }));
    }
  };

  const clearImage = () => {
    setCoverImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      // ✅ Build update data - only include cover_image if a new file was selected
      const bookData: Partial<BookFormData> = {
        title: formData.title,
        author: formData.author,
        quantity: formData.quantity
      };

      // Only include cover_image if user selected a new file
      if (coverImage instanceof File) {
        bookData.cover_image = coverImage;
      }

      await onSubmit(book.id, bookData);
      onClose();
    } catch (error) {
      // Error is handled by the parent component
    }
  };

  const handleClose = () => {
    setErrors({});
    setCoverImage(null);
    setImagePreview(null);
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

            {/* ✅ PROPER FILE INPUT */}
            <div className="form-group full-width">
              <label htmlFor="cover_image">Cover Image</label>

              {/* Image Preview */}
              {imagePreview && (
                <div className="image-preview" style={{ marginBottom: '10px' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: '100px', maxHeight: '150px', borderRadius: '4px' }}
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    style={{ marginLeft: '10px', cursor: 'pointer' }}
                  >
                    ❌ Remove
                  </button>
                </div>
              )}

              <input
                type="file"
                id="cover_image"
                name="cover_image"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ padding: '8px' }}
              />
              <small style={{ display: 'block', marginTop: '4px', color: '#888' }}>
                Leave empty to keep current image
              </small>
              {errors.cover_image && <span className="error-message">{errors.cover_image}</span>}
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
