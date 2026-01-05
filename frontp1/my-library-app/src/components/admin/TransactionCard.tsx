import React from 'react';
import type { Transaction } from '../../types/transaction.types';
import './AdminComponents.css';

interface TransactionCardProps {
  transaction: Transaction;
  onViewDetails: (transaction: Transaction) => void;
  onExtendBorrow?: (transaction: Transaction) => void;
  showAdminActions?: boolean;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onViewDetails,
  onExtendBorrow,
  showAdminActions = false
}) => {
  const borrowDate = new Date(transaction.borrowDate);

  // ✅ FIX: If no expectedReturnDate from backend, calculate as borrow + 14 days
  const expectedReturnDate = transaction.expectedReturnDate
    ? new Date(transaction.expectedReturnDate)
    : new Date(borrowDate.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days default

  const actualReturnDate = transaction.actualReturnDate ? new Date(transaction.actualReturnDate) : null;
  const now = new Date();

  const isOverdue = transaction.status === 'overdue' ||
    (transaction.status === 'active' && expectedReturnDate < now);

  const daysBorrowed = Math.ceil((actualReturnDate || now).getTime() - borrowDate.getTime()) / (1000 * 60 * 60 * 24);
  const daysOverdue = isOverdue && !actualReturnDate ?
    Math.ceil((now.getTime() - expectedReturnDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return isOverdue ? 'overdue' : 'active';
      case 'returned':
        return 'returned';
      case 'overdue':
        return 'overdue';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return isOverdue ? '⚠️' : '📖';
      case 'returned':
        return '✅';
      case 'overdue':
        return '🚨';
      default:
        return '📋';
    }
  };

  return (
    <div className={`transaction-card ${getStatusColor(transaction.status)}`}>
      <div className="transaction-header">
        <div className="transaction-book-info">
          <h3 className="transaction-book-title">
            {transaction.book?.title || 'Unknown Book'}
          </h3>
          <p className="transaction-book-author">
            by {transaction.book?.author || 'Unknown Author'}
          </p>
        </div>
        <div className="transaction-status">
          <span className={`status-badge ${getStatusColor(transaction.status)}`}>
            {getStatusIcon(transaction.status)} {transaction.status}
          </span>
        </div>
      </div>

      <div className="transaction-user-info">
        <div className="user-avatar">
          {transaction.user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="user-details">
          <p className="user-name">{transaction.user?.username || 'Unknown User'}</p>
          <p className="user-email">{transaction.user?.email || ''}</p>
        </div>
      </div>

      <div className="transaction-dates">
        <div className="date-item">
          <span className="date-label">Borrowed:</span>
          <span className="date-value">{borrowDate.toLocaleDateString()}</span>
        </div>
        {/* ✅ Due date: uses expectedReturnDate if provided, else borrow + 14 days */}
        <div className="date-item">
          <span className="date-label">Due:</span>
          <span className={`date-value ${isOverdue ? 'overdue' : ''}`}>
            {expectedReturnDate.toLocaleDateString()}
          </span>
        </div>
        {actualReturnDate && (
          <div className="date-item">
            <span className="date-label">Returned:</span>
            <span className="date-value returned">
              {actualReturnDate.toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <div className="transaction-stats">
        <div className="stat-item">
          <span className="stat-label">Days:</span>
          <span className="stat-value">{Math.floor(daysBorrowed)}</span>
        </div>
        {daysOverdue > 0 && (
          <div className="stat-item overdue">
            <span className="stat-label">Overdue:</span>
            <span className="stat-value">{daysOverdue} days</span>
          </div>
        )}
      </div>

      {transaction.notes && (
        <div className="transaction-notes">
          <span className="notes-icon">📝</span>
          <span className="notes-text">{transaction.notes}</span>
        </div>
      )}

      <div className="transaction-actions">
        <button
          className="action-btn view-details"
          onClick={() => onViewDetails(transaction)}
        >
          👁️ View Details
        </button>

        {showAdminActions && transaction.status === 'active' && (
          <>
            {onExtendBorrow && (
              <button
                className="action-btn extend-borrow"
                onClick={() => onExtendBorrow(transaction)}
              >
                📅 Extend
              </button>
            )}
          </>
        )}
      </div>

      {isOverdue && !actualReturnDate && (
        <div className="overdue-banner">
          <span className="overdue-icon">🚨</span>
          <span className="overdue-text">This book is overdue!</span>
        </div>
      )}
    </div>
  );
};
