import React, { useState } from 'react';
import type { Transaction } from '../../types/transaction.types';
import './UserModal.css';

interface ReturnBookModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSubmit: (returnData: { transactionId: string; returnDate: string; notes?: string }) => Promise<void>;
  isLoading: boolean;
}

export const ReturnBookModal: React.FC<ReturnBookModalProps> = ({
  isOpen,
  transaction,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [notes, setNotes] = useState('');
  const [returnDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transaction) {
      return;
    }

    try {
      await onSubmit({
        transactionId: transaction.id,
        returnDate,
        notes: notes.trim() || undefined
      });
    } catch (error) {
      // Error is handled by parent
    }
  };

  if (!isOpen || !transaction) return null;

  const borrowDate = new Date(transaction.borrowDate);
  const expectedReturnDate = new Date(transaction.expectedReturnDate);
  const actualReturnDate = new Date(returnDate);
  const isOverdue = actualReturnDate > expectedReturnDate;

  const daysBorrowed = Math.ceil((actualReturnDate.getTime() - borrowDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysOverdue = isOverdue ? Math.ceil((actualReturnDate.getTime() - expectedReturnDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

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
              {transaction.book?.coverImageUrl ? (
                <img src={transaction.book.coverImageUrl} alt={transaction.book.title} />
              ) : (
                <div className="return-cover-placeholder">📚</div>
              )}
            </div>
            <div className="return-book-info">
              <h3>{transaction.book?.title}</h3>
              <p>by {transaction.book?.author}</p>
              <div className="return-status">
                {isOverdue ? (
                  <span className="status-badge overdue">
                    ⚠️ Overdue by {daysOverdue} days
                  </span>
                ) : (
                  <span className="status-badge on-time">
                    ✅ On time
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="return-summary">
            <div className="summary-grid">
              <div className="summary-item">
                <strong>Borrowed:</strong>
                <span>{borrowDate.toLocaleDateString()}</span>
              </div>
              <div className="summary-item">
                <strong>Expected Return:</strong>
                <span>{expectedReturnDate.toLocaleDateString()}</span>
              </div>
              <div className="summary-item">
                <strong>Actual Return:</strong>
                <span>{actualReturnDate.toLocaleDateString()}</span>
              </div>
              <div className="summary-item">
                <strong>Days Borrowed:</strong>
                <span>{daysBorrowed} days</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="return-form">
            <div className="form-group">
              <label htmlFor="returnNotes">Return Notes (Optional)</label>
              <textarea
                id="returnNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about the book's condition..."
                rows={3}
                maxLength={200}
              />
              <small className="form-hint">
                {notes.length}/200 characters
              </small>
            </div>

            {isOverdue && (
              <div className="overdue-notice">
                <div className="overdue-icon">⚠️</div>
                <div className="overdue-message">
                  <strong>This book is overdue!</strong>
                  <p>Please return overdue books as soon as possible to avoid penalties.</p>
                </div>
              </div>
            )}

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
                {isLoading ? 'Returning...' : `📚 Return "${transaction.book?.title}"`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
