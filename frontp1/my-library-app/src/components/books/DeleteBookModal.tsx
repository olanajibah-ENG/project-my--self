import React from 'react';
import type { Book } from '../../types/book.types';
import './BookModal.css';

interface DeleteBookModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onConfirm: (book: Book) => Promise<void>;
  isLoading: boolean;
}

export const DeleteBookModal: React.FC<DeleteBookModalProps> = ({
  isOpen,
  book,
  onClose,
  onConfirm,
  isLoading
}) => {
  const handleConfirm = async () => {
    if (!book) return;

    try {
      await onConfirm(book);
      onClose();
    } catch (error) {
      // Error is handled by the parent component
    }
  };

  if (!isOpen || !book) return null;

  return (
    <div className="book-modal-overlay" onClick={onClose}>
      <div className="book-modal delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="book-modal-header">
          <h2>Delete Book</h2>
          <button className="book-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="delete-confirmation">
          <div className="delete-icon">⚠️</div>
          <h3>Are you sure you want to delete this book?</h3>

          <div className="book-details">
            <div className="book-info-row">
              <strong>Title:</strong> {book.title}
            </div>
            <div className="book-info-row">
              <strong>Author:</strong> {book.author}
            </div>
            <div className="book-info-row">
              <strong>Available Quantity:</strong> {book.availableQuantity}/{book.totalQuantity}
            </div>
          </div>

          <p className="delete-warning">
            This action cannot be undone. The book will be permanently removed from the library.
          </p>
        </div>

        <div className="book-modal-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Book'}
          </button>
        </div>
      </div>
    </div>
  );
};
