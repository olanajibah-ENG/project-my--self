// =============================================================================
// 📅 EXTEND BORROW MODAL - Admin modal for extending borrow periods
// =============================================================================
// 
// ⚠️ ISSUE FIXED: Modal was crashing because transaction.expectedReturnDate
//    was undefined (backend doesn't have this field in Transaction model).
// 
// ✅ FIX: Calculate "current expected date" as borrowDate + 14 days default.
// =============================================================================

import React, { useState, useEffect } from 'react';
import type { Transaction } from '../../types/transaction.types';
import './AdminModal.css';

interface ExtendBorrowModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSubmit: (transactionId: string, newReturnDate: string) => Promise<void>;
  isLoading: boolean;
}

export const ExtendBorrowModal: React.FC<ExtendBorrowModalProps> = ({
  isOpen,
  transaction,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [newReturnDate, setNewReturnDate] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ FIX: Calculate current expected date from borrowDate + 14 days
  // (since backend doesn't have expected_return_date field)
  const calculateExpectedDate = (borrowDateStr: string): Date => {
    const borrowDate = new Date(borrowDateStr);
    if (isNaN(borrowDate.getTime())) {
      // Fallback to today if invalid
      return new Date();
    }
    const expectedDate = new Date(borrowDate);
    expectedDate.setDate(expectedDate.getDate() + 14); // 14 days default
    return expectedDate;
  };

  useEffect(() => {
    if (isOpen && transaction) {
      // ✅ FIX: Use borrowDate + 14 days as the "current" expected date
      const currentExpectedDate = calculateExpectedDate(transaction.borrowDate);
      // Set default extension to 14 days from current expected date
      const extendedDate = new Date(currentExpectedDate);
      extendedDate.setDate(extendedDate.getDate() + 14);
      setNewReturnDate(extendedDate.toISOString().split('T')[0]);
      setReason('');
      setErrors({});
    }
  }, [isOpen, transaction]);

  if (!isOpen || !transaction) return null;

  // ✅ FIX: Calculate dates using borrowDate + 14 days
  const currentExpectedDate = calculateExpectedDate(transaction.borrowDate);
  const borrowDate = new Date(transaction.borrowDate);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!newReturnDate) {
      newErrors.newReturnDate = 'New return date is required';
    } else {
      const selectedDate = new Date(newReturnDate);
      const now = new Date();

      if (selectedDate <= currentExpectedDate) {
        newErrors.newReturnDate = 'New return date must be after the current expected date';
      } else if (selectedDate <= now) {
        newErrors.newReturnDate = 'New return date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transaction || !validateForm()) {
      return;
    }

    try {
      await onSubmit(String(transaction.id), newReturnDate);
    } catch (error) {
      // Error is handled by parent
    }
  };

  const selectedDate = newReturnDate ? new Date(newReturnDate) : null;
  const extensionDays = selectedDate ?
    Math.ceil((selectedDate.getTime() - currentExpectedDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 180); // Max 6 months extension
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>Extend Borrow Period</h2>
          <button className="admin-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-modal-content">
          {/* Current Transaction Info */}
          <div className="extend-preview">
            <div className="extend-book-info">
              <h3>{transaction.book?.title || 'Unknown Book'}</h3>
              <p>by {transaction.book?.author || 'Unknown Author'}</p>
              <div className="extend-user">
                <span>Borrowed by: {transaction.user?.username || 'Unknown User'}</span>
              </div>
            </div>
            <div className="extend-current-dates">
              <div className="date-info">
                <strong>Borrow Date:</strong>
                <span>{borrowDate.toLocaleDateString()}</span>
              </div>
              <div className="date-info">
                <strong>Current Due Date:</strong>
                <span>{currentExpectedDate.toLocaleDateString()}</span>
                <small>(calculated as borrow + 14 days)</small>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="extend-form">
            <div className="form-group">
              <label htmlFor="newReturnDate">New Return Date *</label>
              <input
                type="date"
                id="newReturnDate"
                value={newReturnDate}
                onChange={(e) => setNewReturnDate(e.target.value)}
                min={minDate}
                max={maxDateStr}
                className={errors.newReturnDate ? 'error' : ''}
                required
              />
              {errors.newReturnDate && (
                <span className="error-message">{errors.newReturnDate}</span>
              )}
              <small className="form-hint">
                Maximum extension: 6 months from today
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="reason">Reason for Extension</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for extending the borrow period..."
                rows={3}
                maxLength={200}
              />
              <small className="form-hint">
                {reason.length}/200 characters
              </small>
            </div>

            {/* Extension Summary */}
            <div className="extension-summary">
              <h4>Extension Summary</h4>
              <div className="summary-details">
                <div className="summary-item">
                  <span>Current Due Date:</span>
                  <strong>{currentExpectedDate.toLocaleDateString()}</strong>
                </div>
                <div className="summary-item">
                  <span>New Due Date:</span>
                  <strong>{newReturnDate ? new Date(newReturnDate).toLocaleDateString() : 'Not set'}</strong>
                </div>
                <div className="summary-item">
                  <span>Extension Period:</span>
                  <strong>{extensionDays > 0 ? `${extensionDays} days` : 'N/A'}</strong>
                </div>
              </div>
              {/* ⚠️ Note for student */}
              <small style={{ display: 'block', marginTop: '8px', color: '#6b7280' }}>
                Note: Backend needs expected_return_date field in Transaction model to persist this.
              </small>
            </div>

            <div className="admin-modal-actions">
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
                className="btn-primary extend-submit-btn"
                disabled={isLoading || !newReturnDate || extensionDays <= 0}
              >
                {isLoading ? 'Extending...' : `📅 Extend by ${extensionDays} days`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
