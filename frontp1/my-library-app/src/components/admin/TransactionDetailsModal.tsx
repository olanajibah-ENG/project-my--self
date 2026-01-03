import React, { useState } from 'react';
import type { Transaction } from '../../types/transaction.types';
import './AdminModal.css';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onUpdateStatus: (transactionId: string, newStatus: string) => Promise<void>;
  isLoading: boolean;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  transaction,
  onClose,
  onUpdateStatus,
  isLoading
}) => {
  const [newStatus, setNewStatus] = useState('');

  if (!isOpen || !transaction) return null;

  const borrowDate = new Date(transaction.borrowDate);
  const expectedReturnDate = new Date(transaction.expectedReturnDate);
  const actualReturnDate = transaction.actualReturnDate ? new Date(transaction.actualReturnDate) : null;
  const now = new Date();

  const isOverdue = transaction.status === 'overdue' ||
    (transaction.status === 'active' && expectedReturnDate < now);

  const daysBorrowed = Math.ceil((actualReturnDate || now).getTime() - borrowDate.getTime()) / (1000 * 60 * 60 * 24);
  const daysOverdue = isOverdue && !actualReturnDate ?
    Math.ceil((now.getTime() - expectedReturnDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    await onUpdateStatus(transaction.id, newStatus);
  };

  const getStatusOptions = () => {
    switch (transaction.status) {
      case 'active':
        return [
          { value: 'active', label: 'Active' },
          { value: 'returned', label: 'Mark as Returned' },
          { value: 'overdue', label: 'Mark as Overdue' }
        ];
      case 'overdue':
        return [
          { value: 'overdue', label: 'Overdue' },
          { value: 'returned', label: 'Mark as Returned' }
        ];
      case 'returned':
        return [
          { value: 'returned', label: 'Returned' },
          { value: 'active', label: 'Reactivate' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>Transaction Details</h2>
          <button className="admin-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-modal-content">
          {/* Book Information */}
          <div className="transaction-detail-section">
            <h3>📚 Book Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Title:</strong>
                <span>{transaction.book?.title || 'Unknown Book'}</span>
              </div>
              <div className="detail-item">
                <strong>Author:</strong>
                <span>{transaction.book?.author || 'Unknown Author'}</span>
              </div>
              <div className="detail-item">
                <strong>ISBN:</strong>
                <span>{transaction.book?.isbn || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="transaction-detail-section">
            <h3>👤 User Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Name:</strong>
                <span>{transaction.user?.username || 'Unknown User'}</span>
              </div>
              <div className="detail-item">
                <strong>Email:</strong>
                <span>{transaction.user?.email || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <strong>Role:</strong>
                <span>{transaction.user?.role || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Transaction Timeline */}
          <div className="transaction-detail-section">
            <h3>📅 Transaction Timeline</h3>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-marker borrow"></div>
                <div className="timeline-content">
                  <h4>Borrowed</h4>
                  <p>{borrowDate.toLocaleDateString()} at {borrowDate.toLocaleTimeString()}</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className={`timeline-marker ${actualReturnDate ? 'returned' : isOverdue ? 'overdue' : 'due'}`}></div>
                <div className="timeline-content">
                  <h4>Expected Return</h4>
                  <p>{expectedReturnDate.toLocaleDateString()} at {expectedReturnDate.toLocaleTimeString()}</p>
                  {isOverdue && !actualReturnDate && (
                    <span className="overdue-notice">⚠️ Overdue by {daysOverdue} days</span>
                  )}
                </div>
              </div>

              {actualReturnDate && (
                <div className="timeline-item">
                  <div className="timeline-marker returned"></div>
                  <div className="timeline-content">
                    <h4>Returned</h4>
                    <p>{actualReturnDate.toLocaleDateString()} at {actualReturnDate.toLocaleTimeString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="transaction-detail-section">
            <h3>📊 Statistics</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-value">{Math.floor(daysBorrowed)}</span>
                <span className="stat-label">Days Borrowed</span>
              </div>
              {daysOverdue > 0 && (
                <div className="stat-box overdue">
                  <span className="stat-value">{daysOverdue}</span>
                  <span className="stat-label">Days Overdue</span>
                </div>
              )}
              <div className={`stat-box status-${transaction.status}`}>
                <span className="stat-value">{transaction.status}</span>
                <span className="stat-label">Current Status</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {transaction.notes && (
            <div className="transaction-detail-section">
              <h3>📝 Notes</h3>
              <div className="notes-content">
                {transaction.notes}
              </div>
            </div>
          )}

          {/* Status Update */}
          <div className="transaction-detail-section">
            <h3>🔄 Update Status</h3>
            <div className="status-update">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="status-select"
              >
                <option value="">Select new status...</option>
                {getStatusOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                className="update-status-btn"
                onClick={handleStatusUpdate}
                disabled={!newStatus || isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>

        <div className="admin-modal-actions">
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
