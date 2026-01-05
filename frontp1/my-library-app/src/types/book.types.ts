// =============================================================================
// 📚 BOOK TYPES - Type definitions for the Book entity
// =============================================================================
// 
// ⚠️ ISSUE FOUND: This file was missing some type exports that were being 
// imported in booksStore.ts. When you import a type that doesn't exist,
// TypeScript will show an error like:
//   "Module '"../types/book.types"' has no exported member 'BooksState'"
//
// ✅ FIX: We've added the missing BooksState and BookFilters interfaces below.
// =============================================================================

/**
 * Book interface - represents a single book from the backend
 * 
 * ⚠️ IMPORTANT: These field names MUST match what your Django serializer returns!
 * 
 * Your Django Book model has:
 *   - title: CharField
 *   - author: CharField  
 *   - quantity: PositiveIntegerField
 *   - cover_image: ImageField
 * 
 * So your TypeScript interface should have the SAME field names.
 * 
 * ❌ COMMON MISTAKE: Using camelCase (coverImage) when backend uses snake_case (cover_image)
 * ✅ CORRECT: Match the backend's naming convention exactly
 */
export interface Book {
  id: number;              // Django auto-generates this as an integer, not string!
  title: string;
  author: string;
  quantity: number;        // ⚠️ Not "totalQuantity" or "availableQuantity" - match your model!
  cover_image: string | null;  // ⚠️ snake_case to match Django, can be null if no image
}

/**
 * BookFormData - data structure for creating/updating books
 * 
 * This is what we send TO the backend when creating or updating a book.
 * It doesn't need 'id' because:
 *   - For CREATE: the backend generates the id
 *   - For UPDATE: the id is in the URL (/books/5/)
 */
export interface BookFormData {
  title: string;
  author: string;
  quantity: number;
  cover_image?: File | string;  // Optional: can be a File (upload) or URL string
}

// =============================================================================
// ⚠️ MISSING EXPORTS - These were imported in booksStore.ts but not defined here!
// =============================================================================

/**
 * BooksState - represents the state of the books store
 * 
 * ⚠️ ISSUE: booksStore.ts was importing this type, but it wasn't exported here.
 *    This causes a TypeScript error and the store won't work correctly.
 * 
 * ✅ FIX: Define and export the interface that the store expects.
 * 
 * 💡 TIP: When you create a Zustand store, it's good practice to define the
 *    state interface in your types file, not inline in the store file.
 */
export interface BooksState {
  books: Book[];
  currentBook: Book | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  sortBy: 'title' | 'author' | 'quantity';  // ⚠️ Changed 'rating' to 'quantity' - we don't have rating!
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  totalPages: number;
  totalBooks: number;
}

/**
 * BookFilters - optional filters for querying books
 * 
 * ⚠️ ISSUE: This was also imported in booksStore.ts but not defined.
 * 
 * 💡 TIP: Even if you don't use filters yet, define the interface so your
 *    code compiles. You can add more filter options later.
 */
export interface BookFilters {
  author?: string;
  minQuantity?: number;
  search?: string;
}