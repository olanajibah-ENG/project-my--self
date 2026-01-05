// =============================================================================
// 📚 BOOK CARD - Displays a single book in a card format
// =============================================================================
// 
// ✅ SIMPLIFIED: Backend now returns absolute URLs for cover_image!
//    No need to construct URLs manually anymore.
// 
// ⚠️ OLD CODE (before backend fix):
//    const API_BASE = import.meta.env.VITE_API_BASE_URL...
//    const imageUrl = coverImage.startsWith('http') ? ... : `${API_BASE}${coverImage}`
//
// ✅ NEW CODE: Just use book.cover_image directly!
// =============================================================================

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
          {/* ✅ Backend now returns absolute URL - use directly! */}
          {book.cover_image ? (
            <img src={book.cover_image} alt={book.title} />
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
            {/* ✅ Use book.quantity - matches Django model */}
            <span className="book-quantity">
              Quantity: {book.quantity}
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
            disabled={book.quantity === 0}
          >
            📚 Borrow
          </button>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// 💡 LEARNING: Backend Absolute URLs
// =============================================================================
// 
// BEST PRACTICE: Backend serializers should return absolute URLs for media.
// 
// We fixed this by:
// 1. In BookSerializer.to_representation(), use request.build_absolute_uri()
// 2. In views, pass context={'request': request} to serializer
// 
// Result:
//   Before: { "cover_image": "/media/books/image.jpg" }
//   After:  { "cover_image": "http://localhost:8001/media/books/image.jpg" }
// 
// Frontend can now use the URL directly without any manipulation!
// =============================================================================
