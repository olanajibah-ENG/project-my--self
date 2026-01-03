import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut } from 'lucide-react';
import { useTransactionsStore } from '../../store/transactionsStore';
import type { Transaction } from '../../types/transaction.types';
import { TransactionCard } from '../../components/admin/TransactionCard';
import { TransactionDetailsModal } from '../../components/admin/TransactionDetailsModal';
import { ExtendBorrowModal } from '../../components/admin/ExtendBorrowModal';
import './TransactionsPage.css';

const TransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    transactions,
    myBorrows,
    isLoading,
    error,
    filterStatus,
    fetchTransactions,
    fetchMyBorrows,
    updateTransaction,
    extendBorrow,
    setFilterStatus,
    clearError
  } = useTransactionsStore();

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my-borrows'>('all');

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchTransactions();
      fetchMyBorrows();
    }
  }, [isAuthenticated, user, fetchTransactions, fetchMyBorrows]);

  // Check if user is admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="transactions-page">
        <div className="access-denied">
          <div className="access-denied-icon">🔒</div>
          <h2>Access Denied</h2>
          <p>You need administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsModalOpen(true);
  };

  const handleExtendBorrow = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setExtendModalOpen(true);
  };

  const handleUpdateStatus = async (transactionId: string, newStatus: string) => {
    try {
      await updateTransaction(transactionId, { status: newStatus as 'active' | 'returned' | 'overdue' });
      setDetailsModalOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  };

  const handleExtendSubmit = async (transactionId: string, newReturnDate: string) => {
    try {
      await extendBorrow(transactionId, newReturnDate);
      setExtendModalOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Failed to extend borrow:', error);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filterStatus === 'all') return true;
    return transaction.status === filterStatus;
  });

  const overdueTransactions = transactions.filter(t => t.status === 'overdue');
  const activeTransactions = transactions.filter(t => t.status === 'active');
  const returnedTransactions = transactions.filter(t => t.status === 'returned');

  return (
    <div className="transactions-page">
      <div className="transactions-background">
        <div className="transactions-gradient-1"></div>
        <div className="transactions-gradient-2"></div>
        <div className="transactions-gradient-3"></div>
      </div>

      <div className="transactions-container">
        {/* Admin Navigation */}
        <div className="admin-navigation">
          <nav className="admin-nav">
            <button
              className="nav-item"
              onClick={() => navigate('/books')}
            >
              📚 Books Management
            </button>
            <button
              className="nav-item active"
              onClick={() => navigate('/transactions')}
            >
              📋 Transaction Management
            </button>
            <button
              className="nav-item logout-btn"
              onClick={() => {
                useAuthStore.getState().logout();
                navigate('/auth');
              }}
              title="Logout"
            >
              <LogOut size={16} />
              Logout
            </button>
          </nav>
        </div>

        <div className="transactions-header">
          <div className="transactions-title-section">
            <h1 className="transactions-title">Transaction Management</h1>
            <p className="transactions-subtitle">Manage book borrowings and returns</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="transactions-stats">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <h3>{activeTransactions.length}</h3>
              <p>Active Borrows</p>
            </div>
          </div>
          <div className="stat-card overdue">
            <div className="stat-icon">⚠️</div>
            <div className="stat-info">
              <h3>{overdueTransactions.length}</h3>
              <p>Overdue Returns</p>
            </div>
          </div>
          <div className="stat-card returned">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{returnedTransactions.length}</h3>
              <p>Completed Returns</p>
            </div>
          </div>
          <div className="stat-card total">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{transactions.length}</h3>
              <p>Total Transactions</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="transactions-tabs">
          <button
            className={`transactions-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Transactions ({transactions.length})
          </button>
          <button
            className={`transactions-tab ${activeTab === 'my-borrows' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-borrows')}
          >
            My Borrows ({myBorrows.length})
          </button>
        </div>

        {/* Filter Controls */}
        {activeTab === 'all' && (
          <div className="transactions-filters">
            <div className="filter-group">
              <label>Status Filter:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="filter-select"
              >
                <option value="all">All Transactions</option>
                <option value="active">Active Borrows</option>
                <option value="returned">Returned</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button onClick={clearError} className="error-close">✕</button>
          </div>
        )}

        {/* Transactions List */}
        <div className="transactions-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading transactions...</p>
            </div>
          ) : (activeTab === 'all' ? filteredTransactions : myBorrows).length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No transactions found</h3>
              <p>
                {activeTab === 'all'
                  ? filterStatus === 'all'
                    ? 'No transactions have been recorded yet.'
                    : `No ${filterStatus} transactions found.`
                  : 'You haven\'t borrowed any books yet.'
                }
              </p>
            </div>
          ) : (
            <div className="transactions-grid">
              {(activeTab === 'all' ? filteredTransactions : myBorrows).map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onViewDetails={handleViewDetails}
                  onExtendBorrow={handleExtendBorrow}
                  showAdminActions={activeTab === 'all'}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TransactionDetailsModal
        isOpen={detailsModalOpen}
        transaction={selectedTransaction}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedTransaction(null);
        }}
        onUpdateStatus={handleUpdateStatus}
        isLoading={isLoading}
      />

      <ExtendBorrowModal
        isOpen={extendModalOpen}
        transaction={selectedTransaction}
        onClose={() => {
          setExtendModalOpen(false);
          setSelectedTransaction(null);
        }}
        onSubmit={handleExtendSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default TransactionsPage;
