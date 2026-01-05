// =============================================================================
// 📚 ADD BOOK MODAL - Form for creating new books
// =============================================================================
// 
// ⚠️ ISSUE FOUND: cover_image was using type="url" which sends a string
//    But Django's ImageField expects actual file uploads!
// 
// ✅ FIX: Changed to type="file" for proper file uploads
// =============================================================================

import React, { useState, useRef } from 'react';
import type { BookFormData } from '../../types/book.types';
import './BookModal.css';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookData: BookFormData) => Promise<void>;
  isLoading: boolean;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({
  isOpen,
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

  // ✅ Separate state for the file - cleaner than mixing in formData
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? (value ? Number(value) : 1) : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * ✅ PROPER FILE HANDLING
   * 
   * When user selects a file:
   * 1. Get the File object from e.target.files
   * 2. Store it in state
   * 3. Create a preview URL using URL.createObjectURL
   * 
   * The File object will be sent to the backend via FormData
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, cover_image: 'Please select an image file' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, cover_image: 'Image must be less than 5MB' }));
        return;
      }

      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, cover_image: '' }));

      console.log('📁 File selected:', file.name, file.type, file.size);
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

    if (!validateForm()) {
      return;
    }

    try {
      // ✅ Build the data object with the File (not URL string)
      const bookData: BookFormData = {
        title: formData.title,
        author: formData.author,
        quantity: formData.quantity,
        cover_image: coverImage || undefined  // Pass the File object
      };

      await onSubmit(bookData);

      // Reset form
      setFormData({ title: '', author: '', quantity: 1 });
      clearImage();
      setErrors({});
      onClose();
    } catch (error) {
      // Error is handled by the parent component
    }
  };

  const handleClose = () => {
    setFormData({ title: '', author: '', quantity: 1 });
    clearImage();
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="book-modal-overlay" onClick={handleClose}>
      <div className="book-modal" onClick={(e) => e.stopPropagation()}>
        <div className="book-modal-header">
          <h2>Add New Book</h2>
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

            {/* ✅ PROPER FILE INPUT for image upload */}
            <div className="form-group full-width">
              <label htmlFor="cover_image">Cover Image (Optional)</label>

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

              {/* ✅ File input - NOT URL input! */}
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
                Accepted formats: JPG, PNG, GIF. Max size: 5MB
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
              {isLoading ? 'Adding...' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================================================
// 💡 FILE UPLOAD LEARNING POINTS:
// =============================================================================
// 
// ⚠️ OLD WAY (WRONG):
//    <input type="url" />  → Sends a URL string to ImageField → 400 Error!
// 
// ✅ NEW WAY (CORRECT):
//    <input type="file" accept="image/*" />
//    → Gives you a File object
//    → Service uses FormData to send it
//    → Django saves it to MEDIA_ROOT
// 
// 💡 TIPS:
// 1. Use accept="image/*" to only allow image files
// 2. Validate file size client-side before upload
// 3. Use URL.createObjectURL(file) for preview
// 4. Remember to revoke the URL when done to prevent memory leaks
// =============================================================================
