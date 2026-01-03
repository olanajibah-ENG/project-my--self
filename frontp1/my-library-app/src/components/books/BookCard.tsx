import React from 'react';
import type { Book } from '../../types/book.types';
import './BookCard.css';

interface BookCardProps {
  book: Book;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  isAdmin?: boolean;
  showBorrowButton?: boolean;
  onBorrow?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onEdit,
  onDelete,
  isAdmin = false,
  showBorrowButton = false,
  onBorrow
}) => {
  return (
    <div className="book-card">
      <div className="book-card-header">
        <div className="book-cover">
          {book.coverImageUrl ? (
            <img src={book.coverImageUrl} alt={book.title} />
          ) : (
            <div className="book-cover-placeholder">
              <span>📚</span>
            </div>
          )}
        </div>
        <div className="book-info">
          <h3 className="book-title">{book.title}</h3>
          <p className="book-author">by {book.author}</p>
          <div className="book-meta">
            <span className="book-id">ID: {book.id}</span>
            <span className="book-quantity">
              Quantity: {book.availableQuantity}/{book.totalQuantity}
            </span>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="book-card-actions">
          <button
            className="book-action-btn edit-btn"
            onClick={() => onEdit?.(book)}
            title="Edit Book"
          >
            ✏️ Edit
          </button>
          <button
            className="book-action-btn delete-btn"
            onClick={() => onDelete?.(book)}
            title="Delete Book"
          >
            🗑️ Delete
          </button>
        </div>
      )}

      {showBorrowButton && !isAdmin && (
        <div className="book-card-actions">
          <button
            className="book-action-btn borrow-btn"
            onClick={() => onBorrow?.(book)}
            title="Borrow Book"
            disabled={book.availableQuantity === 0}
          >
            📚 Borrow
          </button>
        </div>
      )}
    </div>
  );
};
