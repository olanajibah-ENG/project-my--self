// =============================================================================
// 📚 BOOKS SERVICE - API calls for book operations
// =============================================================================
// 
// ⚠️ CRITICAL BUG FOUND: Double API prefix!
// 
// Your api.ts has: baseURL = 'http://127.0.0.1:8001/api'
// This service was calling: '/api/books/'
// Result: The actual request went to '/api/api/books/' → 404 NOT FOUND!
//
// ❌ WRONG: api.get('/api/books/')  → becomes /api/api/books/
// ✅ CORRECT: api.get('/books/')     → becomes /api/books/
//
// 💡 TIP: When you set a baseURL in axios, you don't repeat that part in calls!
// =============================================================================

import api from './api';
import type { Book, BookFormData } from '../types/book.types';

export const booksService = {
  /**
   * Get all books from the backend
   * 
   * ⚠️ FIX: Changed from '/api/books/' to '/books/'
   *    The baseURL already includes '/api', so we don't need it here!
   */
  getBooks: async (): Promise<Book[]> => {
    const response = await api.get<Book[]>('/books/');
    return response.data;
  },

  /**
   * Create a new book (Admin only)
   * 
   * ✅ PROPER FILE UPLOAD IMPLEMENTATION
   * 
   * When uploading files to Django's ImageField, you MUST use FormData
   * and set Content-Type to 'multipart/form-data' (axios does this automatically
   * when you pass FormData).
   * 
   * ⚠️ OLD ISSUE: The frontend was sending JSON with a URL string for cover_image.
   *    Django's ImageField expects actual file data, not URLs!
   * 
   * 💡 HOW FILE UPLOADS WORK:
   *    1. HTML <input type="file"> gives you a File object
   *    2. You append the File to FormData
   *    3. Axios sends it as multipart/form-data
   *    4. Django receives it and saves to MEDIA_ROOT
   */
  addBook: async (bookData: BookFormData): Promise<Book> => {
    // ✅ Create FormData for proper file upload
    const formData = new FormData();

    // Add text fields
    formData.append('title', bookData.title);
    formData.append('author', bookData.author);
    formData.append('quantity', String(bookData.quantity));

    // Add cover_image only if it's a File object (not a URL string)
    if (bookData.cover_image instanceof File) {
      formData.append('cover_image', bookData.cover_image);
      console.log('📤 Uploading file:', bookData.cover_image.name);
    }
    // If it's a string URL, we skip it - ImageField can't handle URLs
    // The book will be created without an image

    // ✅ Send as FormData - axios automatically sets Content-Type: multipart/form-data
    const response = await api.post<Book>('/books/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Update an existing book (Admin only)
   * 
   * Same FormData approach for updates that include images.
   */
  updateBook: async (id: number, bookData: Partial<BookFormData>): Promise<Book> => {
    const formData = new FormData();

    // Only append fields that are provided
    if (bookData.title) formData.append('title', bookData.title);
    if (bookData.author) formData.append('author', bookData.author);
    if (bookData.quantity !== undefined) formData.append('quantity', String(bookData.quantity));

    // Handle cover_image
    if (bookData.cover_image instanceof File) {
      formData.append('cover_image', bookData.cover_image);
    }

    const response = await api.put<Book>(`/books/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Delete a book (Admin only)
   */
  deleteBook: async (id: number): Promise<void> => {
    await api.delete(`/books/${id}/`);
  },

  /**
   * Get a single book by ID
   */
  getBookById: async (id: number): Promise<Book> => {
    const response = await api.get<Book>(`/books/${id}/`);
    return response.data;
  }
};

// =============================================================================
// 💡 FILE UPLOAD LEARNING POINTS:
// =============================================================================
// 
// 1. FormData: Required for file uploads. You can't just send JSON!
//    
// 2. Content-Type: When using FormData, use 'multipart/form-data'.
//    Axios sets this automatically when you pass FormData.
//
// 3. File vs String: Check with `instanceof File` before appending.
//    Don't try to send URL strings to ImageField!
//
// 4. Backend Requirements:
//    - Django needs MEDIA_URL and MEDIA_ROOT configured
//    - Serializer uses ImageField with required=False
//    - URL patterns need: + static(settings.MEDIA_URL, document_root=...)
//
// 5. To use in a React form:
//    <input type="file" onChange={(e) => setFile(e.target.files?.[0])} />
// =============================================================================