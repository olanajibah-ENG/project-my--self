// =============================================================================
// 📚 BORROW BOOK MODAL - Form for borrowing a book
// =============================================================================

import React from 'react';
import type { Book } from '../../types/book.types';
import './UserModal.css';

interface BorrowBookModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onSubmit: (bookId: number) => Promise<void>;
  isLoading: boolean;
}

export const BorrowBookModal: React.FC<BorrowBookModalProps> = ({
  isOpen,
  book,
  onClose,
  onSubmit,
  isLoading
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;

    try {
      await onSubmit(book.id);
      onClose();
    } catch (error) {
      // Error is handled by parent
    }
  };

  if (!isOpen || !book) return null;

  return (
    <div className="user-modal-overlay" onClick={onClose}>
      <div className="user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-modal-header">
          <h2>Borrow Book</h2>
          <button className="user-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="user-modal-content">
          <div className="borrow-book-preview">
            <div className="borrow-book-cover">
              {/* ✅ Backend returns absolute URL - use directly! */}
              {book.cover_image ? (
                <img src={book.cover_image} alt={book.title} />
              ) : (
                <div className="borrow-cover-placeholder">📚</div>
              )}
            </div>
            <div className="borrow-book-info">
              <h3>{book.title}</h3>
              <p>by {book.author}</p>
              <div className="borrow-availability">
                <span className="availability-badge">
                  {book.quantity > 0 ? '✅ Available' : '❌ Unavailable'}
                </span>
                <small>Quantity: {book.quantity}</small>
              </div>
            </div>
          </div>

          <div className="borrow-summary">
            <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              Click "Borrow" to check out this book. The standard loan period is 14 days.
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
                className="btn-primary borrow-submit-btn"
                disabled={isLoading || book.quantity === 0}
              >
                {isLoading ? 'Borrowing...' : `📚 Borrow "${book.title}"`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
