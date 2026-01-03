import { useEffect, useCallback } from 'react';
import { useBooksStore } from '../store/booksStore';
import { BookFilters } from '../types/book.types';

export const useBooks = (autoFetch: boolean = false) => {
  const {
    books,
    currentBook,
    isLoading,
    error,
    searchQuery,
    sortBy,
    sortOrder,
    currentPage,
    totalPages,
    totalBooks,
    fetchBooks,
    fetchBookById,
    createBook,
    updateBook,
    deleteBook,
    searchBooks,
    setSearchQuery,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    clearError,
    clearCurrentBook
  } = useBooksStore();

  // Auto-fetch books on mount if requested
  useEffect(() => {
    if (autoFetch) {
      fetchBooks();
    }
  }, [autoFetch, fetchBooks]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim()) {
        searchBooks(query);
      } else {
        fetchBooks();
      }
    }, 300),
    [searchBooks, fetchBooks]
  );

  // Handle search input changes
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  }, [setSearchQuery, debouncedSearch]);

  // Handle sorting
  const handleSort = useCallback((newSortBy: typeof sortBy) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    fetchBooks({
      sortBy: newSortBy,
      sortOrder: newSortOrder,
      search: searchQuery
    });
  }, [sortBy, sortOrder, setSortBy, setSortOrder, fetchBooks, searchQuery]);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchBooks({
      page,
      search: searchQuery,
      sortBy,
      sortOrder
    });
  }, [setCurrentPage, fetchBooks, searchQuery, sortBy, sortOrder]);

  // Filter books
  const filterBooks = useCallback((filters: BookFilters) => {
    fetchBooks({
      filters,
      search: searchQuery,
      sortBy,
      sortOrder
    });
  }, [fetchBooks, searchQuery, sortBy, sortOrder]);

  return {
    // State
    books,
    currentBook,
    isLoading,
    error,
    searchQuery,
    sortBy,
    sortOrder,
    currentPage,
    totalPages,
    totalBooks,

    // Computed properties
    hasBooks: books.length > 0,
    isEmpty: books.length === 0 && !isLoading,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,

    // Actions
    fetchBooks,
    fetchBookById,
    createBook,
    updateBook,
    deleteBook,
    searchBooks,
    clearError,
    clearCurrentBook,

    // Enhanced actions
    handleSearchChange,
    handleSort,
    handlePageChange,
    filterBooks,

    // Helpers
    getBookById: (id: string) => books.find(book => book.id === id),
    getAvailableBooks: () => books.filter(book => book.availableQuantity > 0),
    getBooksByCategory: (category: string) => books.filter(book => book.category === category)
  };
};

// Utility function for debouncing
function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
