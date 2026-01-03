import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useBooksStore } from '../../store/booksStore';
import { useTransactionsStore } from '../../store/transactionsStore';
import type { Book } from '../../types/book.types';
import type { Transaction } from '../../types/transaction.types';
import { BookCard } from '../../components/books/BookCard';
import { BorrowBookModal } from '../../components/user/BorrowBookModal';
import { ReturnBookModal } from '../../components/user/ReturnBookModal';
import './UserPage.css';

interface UserPageProps {
  initialTab?: 'browse' | 'borrowed';
}

const UserPage: React.FC<UserPageProps> = ({ initialTab = 'browse' }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { books, isLoading: booksLoading, fetchBooks, searchBooks } = useBooksStore();
  const {
    myBorrows,
    isLoading: transactionsLoading,
    fetchMyBorrows,
    borrowBook,
    returnBook
  } = useTransactionsStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'borrowed'>(initialTab);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBooks();
      fetchMyBorrows();
    }
  }, [isAuthenticated, fetchBooks, fetchMyBorrows]);

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="user-page">
        <div className="access-denied">
          <div className="access-denied-icon">🔒</div>
          <h2>Access Denied</h2>
          <p>You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchBooks(searchTerm.trim());
    } else {
      fetchBooks();
    }
  };

  const handleBorrowBook = (book: Book) => {
    setSelectedBook(book);
    setBorrowModalOpen(true);
  };

  const handleReturnBook = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setReturnModalOpen(true);
  };

  const handleBorrowSubmit = async (borrowData: any) => {
    try {
      await borrowBook(borrowData);
      setBorrowModalOpen(false);
      setSelectedBook(null);
      fetchBooks(); // Refresh books to update availability
      fetchMyBorrows(); // Refresh user's borrows
    } catch (error) {
      console.error('Failed to borrow book:', error);
    }
  };

  const handleReturnSubmit = async (returnData: any) => {
    try {
      await returnBook(returnData);
      setReturnModalOpen(false);
      setSelectedTransaction(null);
      fetchBooks(); // Refresh books to update availability
      fetchMyBorrows(); // Refresh user's borrows
    } catch (error) {
      console.error('Failed to return book:', error);
    }
  };

  const isBookBorrowedByUser = (bookId: string) => {
    return myBorrows.some(transaction =>
      transaction.bookId === bookId &&
      transaction.status === 'active'
    );
  };

  const getBookBorrowStatus = (book: Book) => {
    const available = book.availableQuantity > 0;
    const isBorrowed = isBookBorrowedByUser(book.id);
    return { available, isBorrowed };
  };

  return (
    <div className="user-page">
      <div className="user-background">
        <div className="user-gradient-1"></div>
        <div className="user-gradient-2"></div>
        <div className="user-gradient-3"></div>
      </div>

      <div className="user-container">
        {/* User Navigation */}
        <div className="user-navigation">
          <nav className="user-nav">
            <button
              className={`nav-item ${activeTab === 'browse' ? 'active' : ''}`}
              onClick={() => navigate('/user')}
            >
              📚 Browse Books
            </button>
            <button
              className={`nav-item ${activeTab === 'borrowed' ? 'active' : ''}`}
              onClick={() => navigate('/user/borrows')}
            >
              📖 My Borrows
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

        <div className="user-header">
          <div className="user-welcome">
            <h1 className="user-title">
              {activeTab === 'browse' ? 'Welcome to Our Library' : 'My Book Borrows'}
            </h1>
            <p className="user-subtitle">
              {activeTab === 'browse'
                ? 'Discover amazing books and manage your borrows'
                : 'Track your borrowed books and return dates'
              }
            </p>
          </div>
        </div>


        {/* Browse Books Tab */}
        {activeTab === 'browse' && (
          <>
            {/* Search */}
            <div className="user-controls">
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-container">
                  <input
                    type="text"
                    placeholder="Search books by title, author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <button type="submit" className="search-btn">
                    🔍
                  </button>
                  {searchTerm && (
                    <button
                      type="button"
                      className="clear-search-btn"
                      onClick={() => {
                        setSearchTerm('');
                        fetchBooks();
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Books Grid */}
            <div className="user-content">
              {booksLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading books...</p>
                </div>
              ) : books.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📚</div>
                  <h3>No books found</h3>
                  <p>
                    {searchTerm
                      ? 'Try adjusting your search terms.'
                      : 'The library is currently empty.'
                    }
                  </p>
                </div>
              ) : (
                <div className="books-grid">
                  {books.map((book) => {
                    const { available, isBorrowed } = getBookBorrowStatus(book);
                    return (
                      <BookCard
                        key={book.id}
                        book={book}
                        onEdit={undefined}
                        onDelete={undefined}
                        isAdmin={false}
                        showBorrowButton={available && !isBorrowed}
                        onBorrow={() => handleBorrowBook(book)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* My Borrows Tab */}
        {activeTab === 'borrowed' && (
          <div className="user-content">
            {transactionsLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading your borrows...</p>
              </div>
            ) : myBorrows.filter(t => t.status === 'active').length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📖</div>
                <h3>No active borrows</h3>
                <p>You haven't borrowed any books yet.</p>
                <button
                  className="borrow-books-btn"
                  onClick={() => navigate('/user')}
                >
                  Browse Books
                </button>
              </div>
            ) : (
              <div className="borrows-grid">
                {myBorrows
                  .filter(transaction => transaction.status === 'active')
                  .map((transaction) => (
                    <div key={transaction.id} className="borrow-card">
                      <div className="borrow-card-header">
                        <div className="borrow-book-cover">
                          {transaction.book?.coverImageUrl ? (
                            <img src={transaction.book.coverImageUrl} alt={transaction.book.title} />
                          ) : (
                            <div className="borrow-cover-placeholder">📚</div>
                          )}
                        </div>
                        <div className="borrow-book-info">
                          <h3>{transaction.book?.title}</h3>
                          <p>by {transaction.book?.author}</p>
                          <div className="borrow-dates">
                            <small>
                              Borrowed: {new Date(transaction.borrowDate).toLocaleDateString()}
                            </small>
                            <small>
                              Due: {new Date(transaction.expectedReturnDate).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="borrow-card-actions">
                        <button
                          className="return-btn"
                          onClick={() => handleReturnBook(transaction)}
                        >
                          📚 Return Book
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <BorrowBookModal
        isOpen={borrowModalOpen}
        book={selectedBook}
        onClose={() => {
          setBorrowModalOpen(false);
          setSelectedBook(null);
        }}
        onSubmit={handleBorrowSubmit}
        isLoading={transactionsLoading}
      />

      <ReturnBookModal
        isOpen={returnModalOpen}
        transaction={selectedTransaction}
        onClose={() => {
          setReturnModalOpen(false);
          setSelectedTransaction(null);
        }}
        onSubmit={handleReturnSubmit}
        isLoading={transactionsLoading}
      />
    </div>
  );
};

export default UserPage;
