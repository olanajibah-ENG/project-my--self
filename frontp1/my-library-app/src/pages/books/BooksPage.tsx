import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut } from 'lucide-react';
import { useBooksStore } from '../../store/booksStore';
import type { Book } from '../../types/book.types';
import { BookCard } from '../../components/books/BookCard';
import { AddBookModal } from '../../components/books/AddBookModal';
import { EditBookModal } from '../../components/books/EditBookModal';
import { DeleteBookModal } from '../../components/books/DeleteBookModal';
import './BooksPage.css';

const BooksPage: React.FC = () => {
  console.log('BooksPage component loaded');
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

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchBooks();
    }
  }, [isAuthenticated, fetchBooks]);

  // Check if user is authenticated
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

  // Check if user is admin for management features
  const isAdmin = user?.role === 'admin';
  console.log('BooksPage - User:', user);
  console.log('BooksPage - isAdmin:', isAdmin);
  console.log('BooksPage - isAuthenticated:', isAuthenticated);

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

  const handleUpdateBook = async (id: string, bookData: any) => {
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks({ search: searchTerm.trim() });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchBooks();
  };

  console.log('BooksPage rendering - isAdmin:', isAdmin);

  return (
    <div className="books-page">
      <div className="books-background">
        <div className="books-gradient-1"></div>
        <div className="books-gradient-2"></div>
        <div className="books-gradient-3"></div>
      </div>

      <div className="books-container">
        {/* Admin Navigation */}
        <div className="admin-navigation">
          <nav className="admin-nav">
            <button
              className="nav-item active"
              onClick={() => navigate('/books')}
            >
              📚 Books Management
            </button>
            <button
              className="nav-item"
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

        <div className="books-header">
          <div className="books-title-section">
            <h1 className="books-title">Library Management</h1>
            <p className="books-subtitle">
              {isAdmin ? 'Manage your book collection' : 'Browse our book collection'}
            </p>
          </div>

          {/* Debug info - remove this after testing */}
          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'red', color: 'white', padding: '5px', fontSize: '12px' }}>
            Role: {user?.role || 'none'} | isAdmin: {isAdmin ? 'true' : 'false'}
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

        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button onClick={clearError} className="error-close">✕</button>
          </div>
        )}

        <div className="books-content">
          {isLoading ? (
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
                  ? 'Try adjusting your search terms or add some books to get started.'
                  : 'Get started by adding your first book to the library.'
                }
              </p>
              <div className="offline-notice">
                <small>🔄 Working in offline mode - Backend server not available</small>
              </div>
              {!searchTerm && (
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
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals - Only show for admins */}
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
    </div>
  );
};

export default BooksPage;
