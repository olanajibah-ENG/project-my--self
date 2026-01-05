// =============================================================================
// 📚 RETURN BOOK MODAL - Form for returning a borrowed book
// =============================================================================

import React from 'react';
import './UserModal.css';

interface ReturnBookModalProps {
  isOpen: boolean;
  bookId: number | null;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string | null;  // ✅ Now receives absolute URL from backend
  onClose: () => void;
  onSubmit: (bookId: number) => Promise<void>;
  isLoading: boolean;
}

export const ReturnBookModal: React.FC<ReturnBookModalProps> = ({
  isOpen,
  bookId,
  bookTitle,
  bookAuthor,
  bookCover,
  onClose,
  onSubmit,
  isLoading
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId) return;

    try {
      await onSubmit(bookId);
      onClose();
    } catch (error) {
      // Error is handled by parent
    }
  };

  if (!isOpen || !bookId) return null;

  return (
    <div className="user-modal-overlay" onClick={onClose}>
      <div className="user-modal return-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-modal-header">
          <h2>Return Book</h2>
          <button className="user-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="user-modal-content">
          <div className="return-book-preview">
            <div className="return-book-cover">
              {/* ✅ Backend returns absolute URL - use directly! */}
              {bookCover ? (
                <img src={bookCover} alt={bookTitle} />
              ) : (
                <div className="return-cover-placeholder">📚</div>
              )}
            </div>
            <div className="return-book-info">
              <h3>{bookTitle}</h3>
              <p>by {bookAuthor}</p>
            </div>
          </div>

          <div className="return-summary">
            <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              Click "Return" to return this book to the library.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="user-modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary return-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Returning...' : `📚 Return "${bookTitle}"`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
