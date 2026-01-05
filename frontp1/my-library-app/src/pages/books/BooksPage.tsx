// =============================================================================
// 📚 BOOKS PAGE - Main library view for both admins and regular users
// =============================================================================
// 
// ⚠️ ISSUES FOUND:
// 1. No borrow button for regular users
// 2. No "My Borrows" tab for regular users
// 3. Missing BorrowBookModal import and usage
//
// ✅ FIXES:
// 1. Added showBorrowButton and onBorrow props for non-admins
// 2. Added tabs for "All Books" and "My Borrows"
// 3. Added BorrowBookModal for borrowing
// =============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut } from 'lucide-react';
import { useBooksStore } from '../../store/booksStore';
import { useTransactionsStore } from '../../store/transactionsStore';
import type { Book } from '../../types/book.types';
import { BookCard } from '../../components/books/BookCard';
import { AddBookModal } from '../../components/books/AddBookModal';
import { EditBookModal } from '../../components/books/EditBookModal';
import { DeleteBookModal } from '../../components/books/DeleteBookModal';
import { BorrowBookModal } from '../../components/user/BorrowBookModal';
import './BooksPage.css';

const BooksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    books,
    isLoading,
    error,
    fetchBooks,
    createBook,
    updateBook,
    deleteBook,
    clearError
  } = useBooksStore();

  // ✅ NEW: Access transactions store for borrowing and My Borrows
  const {
    myBorrows,
    fetchMyBorrows,
    borrowBook,
    returnBook,
    isLoading: transactionLoading,
    lastBorrowMessage
  } = useTransactionsStore();

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);  // ✅ NEW
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ NEW: Tab state for switching between All Books and My Borrows
  const [activeTab, setActiveTab] = useState<'all' | 'my-borrows'>('all');

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAuthenticated) {
      fetchBooks();
      fetchMyBorrows();  // ✅ Fetch user's borrows
    }
  }, [isAuthenticated, fetchBooks, fetchMyBorrows]);

  // Refetch borrows after borrow action
  useEffect(() => {
    if (lastBorrowMessage) {
      fetchMyBorrows();
      fetchBooks();  // Refresh to update quantities
    }
  }, [lastBorrowMessage, fetchMyBorrows, fetchBooks]);

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="books-page">
        <div className="access-denied">
          <div className="access-denied-icon">🔒</div>
          <h2>Access Denied</h2>
          <p>You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  // Handlers
  const handleAddBook = async (bookData: any) => {
    try {
      await createBook(bookData);
      setAddModalOpen(false);
    } catch (error) {
      console.error('Failed to create book:', error);
    }
  };

  const handleEditBook = (book: Book) => {
    setSelectedBook(book);
    setEditModalOpen(true);
  };

  const handleUpdateBook = async (id: number, bookData: any) => {
    try {
      await updateBook(id, bookData);
      setEditModalOpen(false);
      setSelectedBook(null);
    } catch (error) {
      console.error('Failed to update book:', error);
    }
  };

  const handleDeleteBook = (book: Book) => {
    setSelectedBook(book);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (book: Book) => {
    try {
      await deleteBook(book.id);
      setDeleteModalOpen(false);
      setSelectedBook(null);
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  };

  // ✅ NEW: Borrow handler for regular users
  const handleBorrowClick = (book: Book) => {
    setSelectedBook(book);
    setBorrowModalOpen(true);
  };

  const handleBorrowSubmit = async (bookId: number) => {
    try {
      await borrowBook(bookId);
      setBorrowModalOpen(false);
      setSelectedBook(null);
      // ✅ FIX: Immediately refresh both lists after borrow
      await fetchMyBorrows();
      await fetchBooks();
    } catch (error) {
      console.error('Failed to borrow book:', error);
    }
  };

  // ✅ NEW: Return handler - with immediate refresh
  const handleReturn = async (bookId: number) => {
    try {
      await returnBook(bookId);
      // ✅ FIX: Immediately refresh both lists after return
      await fetchMyBorrows();
      await fetchBooks();
    } catch (error) {
      console.error('Failed to return book:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchBooks();
  };

  return (
    <div className="books-page">
      <div className="books-background">
        <div className="books-gradient-1"></div>
        <div className="books-gradient-2"></div>
        <div className="books-gradient-3"></div>
      </div>

      <div className="books-container">
        {/* Navigation */}
        <div className="admin-navigation">
          <nav className="admin-nav">
            <button
              className="nav-item active"
              onClick={() => navigate('/books')}
            >
              📚 {isAdmin ? 'Books Management' : 'Browse Books'}
            </button>
            {isAdmin && (
              <button
                className="nav-item"
                onClick={() => navigate('/transactions')}
              >
                📋 Transaction Management
              </button>
            )}
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

        {/* Header */}
        <div className="books-header">
          <div className="books-title-section">
            <h1 className="books-title">
              {isAdmin ? 'Library Management' : 'Library'}
            </h1>
            <p className="books-subtitle">
              {isAdmin
                ? 'Manage your book collection'
                : `Welcome, ${user?.username || 'Reader'}! Browse and borrow books.`}
            </p>
          </div>

          {isAdmin && (
            <button
              className="add-book-btn"
              onClick={() => setAddModalOpen(true)}
            >
              ➕ Add New Book
            </button>
          )}
        </div>

        {/* ✅ NEW: Tabs for regular users to switch views */}
        {!isAdmin && (
          <div className="books-tabs">
            <button
              className={`books-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              📚 All Books ({books.length})
            </button>
            <button
              className={`books-tab ${activeTab === 'my-borrows' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-borrows')}
            >
              📖 My Borrows ({myBorrows.length})
            </button>
          </div>
        )}

        {/* Search (only for All Books tab) */}
        {activeTab === 'all' && (
          <div className="books-controls">
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
                    onClick={handleClearSearch}
                  >
                    ✕
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button onClick={clearError} className="error-close">✕</button>
          </div>
        )}

        {/* Content */}
        <div className="books-content">
          {isLoading || transactionLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading...</p>
            </div>
          ) : activeTab === 'all' ? (
            // ✅ ALL BOOKS VIEW
            books.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>No books found</h3>
                <p>
                  {searchTerm
                    ? 'Try adjusting your search terms.'
                    : 'The library is empty.'}
                </p>
                {isAdmin && !searchTerm && (
                  <button
                    className="add-book-btn empty-add-btn"
                    onClick={() => setAddModalOpen(true)}
                  >
                    ➕ Add Your First Book
                  </button>
                )}
              </div>
            ) : (
              <div className="books-grid">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onEdit={isAdmin ? handleEditBook : undefined}
                    onDelete={isAdmin ? handleDeleteBook : undefined}
                    isAdmin={isAdmin}
                    // ✅ NEW: Show borrow button for non-admins
                    showBorrowButton={!isAdmin}
                    onBorrow={!isAdmin ? handleBorrowClick : undefined}
                  />
                ))}
              </div>
            )
          ) : (
            // ✅ NEW: MY BORROWS VIEW
            myBorrows.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📖</div>
                <h3>No borrowed books</h3>
                <p>You haven't borrowed any books yet. Browse the library to find something to read!</p>
                <button
                  className="add-book-btn"
                  onClick={() => setActiveTab('all')}
                >
                  📚 Browse Books
                </button>
              </div>
            ) : (
              <div className="borrows-list">
                {myBorrows.map((borrow) => (
                  <div key={borrow.id} className="borrow-card">
                    <div className="borrow-cover">
                      {borrow.book_cover ? (
                        <img src={borrow.book_cover} alt={borrow.book_title} />
                      ) : (
                        <div className="borrow-cover-placeholder">📚</div>
                      )}
                    </div>
                    <div className="borrow-info">
                      <h3>{borrow.book_title}</h3>
                      <p>by {borrow.book_author}</p>
                      <p className="borrow-date">
                        Borrowed: {new Date(borrow.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="borrow-actions">
                      <button
                        className="return-btn"
                        onClick={() => handleReturn(borrow.book_id)}
                        disabled={transactionLoading}
                      >
                        {transactionLoading ? 'Returning...' : '📤 Return Book'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Admin Modals */}
      {isAdmin && (
        <>
          <AddBookModal
            isOpen={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            onSubmit={handleAddBook}
            isLoading={isLoading}
          />

          <EditBookModal
            isOpen={editModalOpen}
            book={selectedBook}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedBook(null);
            }}
            onSubmit={handleUpdateBook}
            isLoading={isLoading}
          />

          <DeleteBookModal
            isOpen={deleteModalOpen}
            book={selectedBook}
            onClose={() => {
              setDeleteModalOpen(false);
              setSelectedBook(null);
            }}
            onConfirm={handleConfirmDelete}
            isLoading={isLoading}
          />
        </>
      )}

      {/* ✅ NEW: Borrow Modal for regular users */}
      <BorrowBookModal
        isOpen={borrowModalOpen}
        book={selectedBook}
        onClose={() => {
          setBorrowModalOpen(false);
          setSelectedBook(null);
        }}
        onSubmit={handleBorrowSubmit}
        isLoading={transactionLoading}
      />
    </div>
  );
};

export default BooksPage;
