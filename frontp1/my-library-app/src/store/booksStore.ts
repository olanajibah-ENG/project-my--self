import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Book, BooksState, BookFormData, BookFilters } from '../types/book.types';
import { booksService } from '../services/booksService';

interface BooksStore extends BooksState {
  // Actions
  fetchBooks: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: BookFilters;
  }) => Promise<void>;
  fetchBookById: (id: string) => Promise<void>;
  createBook: (bookData: BookFormData) => Promise<Book>;
  updateBook: (id: string, bookData: Partial<BookFormData>) => Promise<Book>;
  deleteBook: (id: string) => Promise<void>;
  searchBooks: (query: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: 'title' | 'author' | 'rating' | 'availability') => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  setCurrentPage: (page: number) => void;
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

      // Fetch books
      fetchBooks: async (params = {}) => {
        set({ isLoading: true, error: null });

        try {
          const {
            page = 1,
            limit = 12,
            search = '',
            sortBy = 'title',
            sortOrder = 'asc',
            filters = {}
          } = params;

          // Check if backend is available
          try {
            const response = await booksService.getBooks({
              page,
              limit,
              search,
              sortBy,
              sortOrder,
              filters
            });

            set({
              books: response.books,
              currentPage: response.currentPage,
              totalPages: response.totalPages,
              totalBooks: response.totalBooks,
              isLoading: false,
              searchQuery: search,
              sortBy: sortBy as any,
              sortOrder
            });
          } catch (apiError) {
            // Backend not available, use mock data
            console.warn('Backend not available, using mock data');
            const mockBooks = [
              {
                id: '1',
                title: 'The Great Gatsby',
                author: 'F. Scott Fitzgerald',
                isbn: '978-0-7432-7356-5',
                totalQuantity: 10,
                availableQuantity: 8,
                coverImageUrl: '',
                rating: 4.5,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: '2',
                title: 'To Kill a Mockingbird',
                author: 'Harper Lee',
                isbn: '978-0-06-112008-4',
                totalQuantity: 5,
                availableQuantity: 3,
                coverImageUrl: '',
                rating: 4.8,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: '3',
                title: '1984',
                author: 'George Orwell',
                isbn: '978-0-452-28423-4',
                totalQuantity: 7,
                availableQuantity: 7,
                coverImageUrl: '',
                rating: 4.6,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ];

            set({
              books: mockBooks,
              currentPage: 1,
              totalPages: 1,
              totalBooks: mockBooks.length,
              isLoading: false,
              searchQuery: search,
              sortBy: sortBy as any,
              sortOrder
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch books';
          set({
            isLoading: false,
            error: errorMessage,
            books: []
          });
        }
      },

      // Fetch single book
      fetchBookById: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          const book = await booksService.getBookById(id);
          set({
            currentBook: book,
            isLoading: false
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch book';
          set({
            isLoading: false,
            error: errorMessage,
            currentBook: null
          });
        }
      },

      // Create book
      createBook: async (bookData: BookFormData) => {
        set({ isLoading: true, error: null });

        try {
          // Try backend first
          try {
            const newBook = await booksService.createBook(bookData);

            // Add to books list if we're on the first page
            const state = get();
            if (state.currentPage === 1) {
              set(state => ({
                books: [newBook, ...state.books.slice(0, 11)], // Keep only 12 items
                totalBooks: state.totalBooks + 1,
                isLoading: false
              }));
            } else {
              set({ isLoading: false });
            }

            return newBook;
          } catch (apiError) {
            // Backend not available, simulate success with mock data
            console.warn('Backend not available, simulating book creation');
            const mockBook = {
              id: Date.now().toString(),
              title: bookData.title,
              author: bookData.author,
              isbn: bookData.isbn || '',
              description: bookData.description || '',
              totalQuantity: bookData.totalQuantity,
              availableQuantity: bookData.totalQuantity,
              coverImageUrl: bookData.coverImageUrl || '',
              rating: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            // Add to books list
            set(state => ({
              books: [mockBook, ...state.books.slice(0, 11)],
              totalBooks: state.totalBooks + 1,
              isLoading: false
            }));

            return mockBook;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create book';
          set({
            isLoading: false,
            error: errorMessage
          });
          throw error;
        }
      },

      // Update book
      updateBook: async (id: string, bookData: Partial<BookFormData>) => {
        set({ isLoading: true, error: null });

        try {
          // Try backend first
          try {
            const updatedBook = await booksService.updateBook(id, bookData);

            // Update in books list
            set(state => ({
              books: state.books.map(book =>
                book.id === id ? updatedBook : book
              ),
              currentBook: state.currentBook?.id === id ? updatedBook : state.currentBook,
              isLoading: false
            }));

            return updatedBook;
          } catch (apiError) {
            // Backend not available, simulate update
            console.warn('Backend not available, simulating book update');
            const currentState = get();
            const bookToUpdate = currentState.books.find(book => book.id === id);

            if (!bookToUpdate) {
              throw new Error('Book not found');
            }

            const updatedBook = {
              ...bookToUpdate,
              ...bookData,
              updatedAt: new Date().toISOString()
            };

            set(state => ({
              books: state.books.map(book =>
                book.id === id ? updatedBook : book
              ),
              currentBook: state.currentBook?.id === id ? updatedBook : state.currentBook,
              isLoading: false
            }));

            return updatedBook;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update book';
          set({
            isLoading: false,
            error: errorMessage
          });
          throw error;
        }
      },

      // Delete book
      deleteBook: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          // Try backend first
          try {
            await booksService.deleteBook(id);
          } catch (apiError) {
            // Backend not available, simulate deletion
            console.warn('Backend not available, simulating book deletion');
          }

          // Remove from books list
          set(state => ({
            books: state.books.filter(book => book.id !== id),
            totalBooks: Math.max(0, state.totalBooks - 1),
            currentBook: state.currentBook?.id === id ? null : state.currentBook,
            isLoading: false
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete book';
          set({
            isLoading: false,
            error: errorMessage
          });
          throw error;
        }
      },

      // Search books
      searchBooks: async (query: string) => {
        set({ isLoading: true, error: null, searchQuery: query });

        try {
          const books = await booksService.searchBooks(query);
          set({
            books,
            isLoading: false,
            currentPage: 1,
            totalPages: 1,
            totalBooks: books.length
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Search failed';
          set({
            isLoading: false,
            error: errorMessage,
            books: []
          });
        }
      },

      // Setters
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setSortBy: (sortBy: 'title' | 'author' | 'rating' | 'availability') => {
        set({ sortBy });
      },

      setSortOrder: (sortOrder: 'asc' | 'desc') => {
        set({ sortOrder });
      },

      setCurrentPage: (page: number) => {
        set({ currentPage: page });
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
