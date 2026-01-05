// =============================================================================
// 📚 BOOKS STORE - Zustand store for book state management
// =============================================================================
// 
// ⚠️ ISSUES FOUND:
// 1. Imported types that didn't exist (BooksState, BookFilters) - now fixed in types!
// 2. Mock data used wrong property names (totalQuantity, coverImageUrl, etc.)
// 3. Store methods expected paginated response but service returns plain array
//
// ✅ KEY LESSON: Your backend returns a SIMPLE ARRAY of books, not a paginated object!
//    GET /api/books/ returns: [{id, title, author, quantity, cover_image}, ...]
//    NOT: { books: [...], totalPages: 1, currentPage: 1 }
// =============================================================================

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Book, BooksState, BookFormData } from '../types/book.types';
import { booksService } from '../services/booksService';

interface BooksStore extends BooksState {
  fetchBooks: () => Promise<void>;
  fetchBookById: (id: number) => Promise<void>;
  createBook: (bookData: BookFormData) => Promise<Book>;
  updateBook: (id: number, bookData: Partial<BookFormData>) => Promise<Book>;
  deleteBook: (id: number) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: 'title' | 'author' | 'quantity') => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  clearError: () => void;
  clearCurrentBook: () => void;
}

export const useBooksStore = create<BooksStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      books: [],
      currentBook: null,
      isLoading: false,
      error: null,
      searchQuery: '',
      sortBy: 'title',
      sortOrder: 'asc',
      currentPage: 1,
      totalPages: 1,
      totalBooks: 0,

      // =================================================================
      // FETCH BOOKS
      // =================================================================
      /**
       * ⚠️ CRITICAL FIX: Your backend returns a simple array, not paginated data!
       * 
       * Your BookListView.get() does:
       *   books = Book.objects.all()
       *   serializer = BookSerializer(books, many=True)
       *   return Response(serializer.data)  ← This is just an array!
       * 
       * So we get: [{id, title, author, quantity, cover_image}, ...]
       * NOT: { books: [...], totalPages: 1, ... }
       */
      fetchBooks: async () => {
        set({ isLoading: true, error: null });

        try {
          // ✅ FIX: Service now returns Book[] directly (simple array)
          const books = await booksService.getBooks();

          console.log('BooksStore: Fetched books:', books.length);

          set({
            books: books,
            totalBooks: books.length,
            totalPages: 1,  // No pagination from backend
            currentPage: 1,
            isLoading: false
          });

        } catch (error: any) {
          console.error('BooksStore: Failed to fetch books:', error);
          set({
            isLoading: false,
            error: error.message || 'Failed to fetch books',
            books: []
          });
        }
      },

      // =================================================================
      // FETCH SINGLE BOOK
      // =================================================================
      fetchBookById: async (id: number) => {
        set({ isLoading: true, error: null });

        try {
          const book = await booksService.getBookById(id);
          set({
            currentBook: book,
            isLoading: false
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to fetch book',
            currentBook: null
          });
        }
      },

      // =================================================================
      // CREATE BOOK
      // =================================================================
      /**
       * Creates a new book (Admin only)
       * 
       * ⚠️ NOTE: Your backend checks is_staff in the view.
       *    If the user is not an admin, they'll get a 403 error.
       */
      createBook: async (bookData: BookFormData) => {
        set({ isLoading: true, error: null });

        try {
          const newBook = await booksService.addBook(bookData);

          console.log('BooksStore: Created book:', newBook);

          // Add to the beginning of the books list
          set(state => ({
            books: [newBook, ...state.books],
            totalBooks: state.totalBooks + 1,
            isLoading: false
          }));

          return newBook;

        } catch (error: any) {
          console.error('BooksStore: Failed to create book:', error);
          set({
            isLoading: false,
            error: error.message || 'Failed to create book'
          });
          throw error;
        }
      },

      // =================================================================
      // UPDATE BOOK
      // =================================================================
      updateBook: async (id: number, bookData: Partial<BookFormData>) => {
        set({ isLoading: true, error: null });

        try {
          const updatedBook = await booksService.updateBook(id, bookData);

          // Update in the books list
          set(state => ({
            books: state.books.map(book =>
              book.id === id ? updatedBook : book
            ),
            currentBook: state.currentBook?.id === id ? updatedBook : state.currentBook,
            isLoading: false
          }));

          return updatedBook;

        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to update book'
          });
          throw error;
        }
      },

      // =================================================================
      // DELETE BOOK
      // =================================================================
      deleteBook: async (id: number) => {
        set({ isLoading: true, error: null });

        try {
          await booksService.deleteBook(id);

          // Remove from books list
          set(state => ({
            books: state.books.filter(book => book.id !== id),
            totalBooks: Math.max(0, state.totalBooks - 1),
            currentBook: state.currentBook?.id === id ? null : state.currentBook,
            isLoading: false
          }));

        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to delete book'
          });
          throw error;
        }
      },

      // =================================================================
      // SETTERS (for filtering/sorting - client-side only for now)
      // =================================================================
      // 
      // ⚠️ NOTE: Your backend doesn't support search/sort parameters yet!
      //    These are stored but not sent to the backend.
      //    To add server-side filtering, you'd modify BookListView.get() to:
      //      - Read query params: request.query_params.get('search')
      //      - Filter queryset: Book.objects.filter(title__icontains=search)
      // =================================================================

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setSortBy: (sortBy: 'title' | 'author' | 'quantity') => {
        set({ sortBy });
      },

      setSortOrder: (sortOrder: 'asc' | 'desc') => {
        set({ sortOrder });
      },

      clearError: () => {
        set({ error: null });
      },

      clearCurrentBook: () => {
        set({ currentBook: null });
      }
    }),
    { name: 'books-store' }
  )
);

// =============================================================================
// ⚠️ REMOVED: MOCK DATA FALLBACK
// =============================================================================
// 
// The original store had a try/catch that fell back to mock data if the API
// failed. This is problematic because:
//
// 1. It hides real errors - you won't know if your API is broken
// 2. Mock data used wrong property names that don't match your Book type
// 3. It creates confusion between real and fake data
//
// ❌ Mock data used:
//    { id: '1', isbn: '...', totalQuantity: 10, coverImageUrl: '', rating: 4.5 }
//
// ✅ Real data has:
//    { id: 1, title: '...', author: '...', quantity: 10, cover_image: null }
//
// 💡 LESSON: Keep your types in sync with your backend model!
// =============================================================================
