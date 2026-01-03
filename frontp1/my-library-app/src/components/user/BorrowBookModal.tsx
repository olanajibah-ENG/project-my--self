import React, { useState, useEffect } from 'react';
import type { Book } from '../../types/book.types';
import './UserModal.css';

interface BorrowBookModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onSubmit: (borrowData: { bookId: string; expectedReturnDate: string; notes?: string }) => Promise<void>;
  isLoading: boolean;
}

export const BorrowBookModal: React.FC<BorrowBookModalProps> = ({
  isOpen,
  book,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && book) {
      // Set default return date to 14 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 14);
      setExpectedReturnDate(defaultDate.toISOString().split('T')[0]);
      setNotes('');
      setErrors({});
    }
  }, [isOpen, book]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!expectedReturnDate) {
      newErrors.expectedReturnDate = 'Return date is required';
    } else {
      const selectedDate = new Date(expectedReturnDate);
      const today = new Date();
      const maxDate = new Date();
      maxDate.setDate(today.getDate() + 90); // Max 90 days

      if (selectedDate <= today) {
        newErrors.expectedReturnDate = 'Return date must be in the future';
      } else if (selectedDate > maxDate) {
        newErrors.expectedReturnDate = 'Maximum borrow period is 90 days';
      }
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
      await onSubmit({
        bookId: String(book.id),
        expectedReturnDate,
        notes: notes.trim() || undefined
      });
      setNotes('');
      onClose();
    } catch (error) {
      // Error is handled by parent
    }
  };

  if (!isOpen || !book) return null;

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  const maxDateStr = maxDate.toISOString().split('T')[0];

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
                  {(book.availableQuantity ?? 0) > 0 ? '✅ Available' : '❌ Unavailable'}
                </span>
                <small>
                  Available: {book.availableQuantity ?? 0}/{book.quantity}
                </small>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="borrow-form">
            <div className="form-group">
              <label htmlFor="returnDate">Expected Return Date *</label>
              <input
                type="date"
                id="returnDate"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                min={minDate}
                max={maxDateStr}
                className={errors.expectedReturnDate ? 'error' : ''}
                required
              />
              {errors.expectedReturnDate && (
                <span className="error-message">{errors.expectedReturnDate}</span>
              )}
              <small className="form-hint">
                You can borrow books for up to 90 days
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or notes..."
                rows={3}
                maxLength={200}
              />
              <small className="form-hint">
                {notes.length}/200 characters
              </small>
            </div>

            <div className="borrow-summary">
              <div className="summary-item">
                <strong>Borrow Date:</strong> {new Date().toLocaleDateString()}
              </div>
              <div className="summary-item">
                <strong>Return Date:</strong> {expectedReturnDate ? new Date(expectedReturnDate).toLocaleDateString() : 'Not set'}
              </div>
              <div className="summary-item">
                <strong>Duration:</strong> {
                  expectedReturnDate
                    ? Math.ceil((new Date(expectedReturnDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + ' days'
                    : 'Not calculated'
                }
              </div>
            </div>

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
                disabled={isLoading || (book.availableQuantity ?? 0) === 0}
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
