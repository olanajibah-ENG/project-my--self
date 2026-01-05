// =============================================================================
// 💳 TRANSACTIONS STORE - Zustand store for borrow/return operations
// =============================================================================
// 
// ✅ COMPLETE IMPLEMENTATION with all admin features:
//    - borrowBook: Borrow a book
//    - returnBook: Return a book
//    - fetchMyBorrows: Get user's borrows
//    - fetchTransactions: Get all transactions (Admin)
//    - updateTransaction: Update status (Admin)
//    - extendBorrow: Extend borrow period (Admin)
// =============================================================================

import { create } from 'zustand';
import { transactionsService } from '../services/transactionsService';
import type { BorrowTransaction } from '../services/transactionsService';
import type { Transaction } from '../types/transaction.types';

interface TransactionsState {
  // Admin: All transactions in the system
  transactions: Transaction[];
  // User: Current user's borrowed books
  myBorrows: BorrowTransaction[];
  isLoading: boolean;
  error: string | null;
  lastBorrowMessage: string | null;
  lastReturnMessage: string | null;
  filterStatus: 'all' | 'active' | 'returned' | 'overdue';
}

interface TransactionsStore extends TransactionsState {
  borrowBook: (bookId: number) => Promise<void>;
  returnBook: (bookId: number) => Promise<void>;
  fetchMyBorrows: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  extendBorrow: (id: string, newReturnDate: string) => Promise<void>;
  setFilterStatus: (status: 'all' | 'active' | 'returned' | 'overdue') => void;
  clearError: () => void;
  clearMessages: () => void;
}

export const useTransactionsStore = create<TransactionsStore>((set, get) => ({
  // Initial state
  transactions: [],
  myBorrows: [],
  isLoading: false,
  error: null,
  lastBorrowMessage: null,
  lastReturnMessage: null,
  filterStatus: 'all',

  // =================================================================
  // USER: BORROW BOOK
  // =================================================================
  borrowBook: async (bookId: number) => {
    set({ isLoading: true, error: null, lastBorrowMessage: null });

    try {
      const response = await transactionsService.borrowBook(bookId);
      console.log('✅ Borrow successful:', response);

      set({
        isLoading: false,
        lastBorrowMessage: response.msg
      });

      // Refresh my borrows list
      get().fetchMyBorrows();

    } catch (error: any) {
      console.error('❌ Borrow failed:', error);
      set({
        isLoading: false,
        error: error.response?.data?.error || error.message || 'Failed to borrow book'
      });
      throw error;
    }
  },

  // =================================================================
  // USER: RETURN BOOK
  // =================================================================
  returnBook: async (bookId: number) => {
    set({ isLoading: true, error: null, lastReturnMessage: null });

    try {
      const response = await transactionsService.returnBook(bookId);
      console.log('✅ Return successful:', response);

      set({
        isLoading: false,
        lastReturnMessage: response.msg
      });

      // Refresh my borrows list
      get().fetchMyBorrows();

    } catch (error: any) {
      console.error('❌ Return failed:', error);
      set({
        isLoading: false,
        error: error.response?.data?.error || error.message || 'Failed to return book'
      });
      throw error;
    }
  },

  // =================================================================
  // USER: FETCH MY BORROWS
  // =================================================================
  fetchMyBorrows: async () => {
    set({ isLoading: true, error: null });

    try {
      const borrows = await transactionsService.getMyBorrows();
      console.log('✅ Fetched my borrows:', borrows.length);

      set({
        myBorrows: borrows,
        isLoading: false
      });

    } catch (error: any) {
      console.error('❌ Failed to fetch borrows:', error);
      set({
        isLoading: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch borrows',
        myBorrows: []
      });
    }
  },

  // =================================================================
  // ⚠️ ADMIN: FETCH ALL TRANSACTIONS
  // =================================================================
  fetchTransactions: async () => {
    set({ isLoading: true, error: null });

    try {
      // ✅ Now using real backend endpoint!
      const transactions = await transactionsService.getAllTransactions();
      console.log('✅ Fetched all transactions:', transactions.length);

      // Map to Transaction type expected by TransactionsPage/TransactionCard
      // ✅ Now using real expected_return_date from backend!
      const mappedTransactions: Transaction[] = transactions.map(t => ({
        id: t.id,
        userId: t.user_id,
        bookId: t.book_id,
        borrowDate: t.date,
        expected_return_date: t.expected_return_date || '',
        expectedReturnDate: t.expected_return_date || undefined,  // For TransactionCard
        status: (t.action_type === 'return' ? 'returned' : 'active') as 'active' | 'returned' | 'overdue',

        // ✅ NEW: Nested book object for TransactionCard
        book: {
          id: t.book_id,
          title: t.book_title,
          author: t.book_author,
          coverImageUrl: t.book_cover || undefined
        },

        // ✅ NEW: Nested user object for TransactionCard
        user: {
          id: t.user_id,
          username: t.user_username,
          email: t.user_email
        }
      }));

      set({
        transactions: mappedTransactions,
        isLoading: false
      });
    } catch (error: any) {
      console.error('❌ Failed to fetch transactions:', error);
      set({
        isLoading: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch transactions',
        transactions: []
      });
    }
  },

  // =================================================================
  // ⚠️ ADMIN: UPDATE TRANSACTION STATUS
  // =================================================================
  updateTransaction: async (id: string, data: Partial<Transaction>) => {
    set({ isLoading: true, error: null });

    try {
      if (data.status) {
        await transactionsService.updateTransaction(
          Number(id),
          { status: data.status }
        );
        console.log('✅ Transaction updated:', id, data.status);
      }

      set({ isLoading: false });

      // Refresh the transactions list
      get().fetchTransactions();

    } catch (error: any) {
      console.error('❌ Failed to update transaction:', error);
      set({
        isLoading: false,
        error: error.response?.data?.error || error.message || 'Failed to update transaction'
      });
      throw error;
    }
  },

  // =================================================================
  // ⚠️ ADMIN: EXTEND BORROW PERIOD
  // =================================================================
  extendBorrow: async (id: string, newReturnDate: string) => {
    set({ isLoading: true, error: null });

    try {
      await transactionsService.extendBorrow(Number(id), newReturnDate);
      console.log('✅ Borrow extended:', id, newReturnDate);

      set({ isLoading: false });

      // Refresh the transactions list
      get().fetchTransactions();

    } catch (error: any) {
      console.error('❌ Failed to extend borrow:', error);
      set({
        isLoading: false,
        error: error.response?.data?.error || error.message || 'Failed to extend borrow'
      });
      throw error;
    }
  },

  // =================================================================
  // FILTER STATUS
  // =================================================================
  setFilterStatus: (status) => {
    set({ filterStatus: status });
  },

  clearError: () => set({ error: null }),
  clearMessages: () => set({ lastBorrowMessage: null, lastReturnMessage: null })
}));

// =============================================================================
// 💡 LEARNING POINTS:
// =============================================================================
// 
// 1. ZUSTAND GET():
//    Use get() to access store methods from within other methods.
//    Example: get().fetchMyBorrows() to refresh after borrow.
//
// 2. ERROR HANDLING:
//    Access nested error from response: error.response?.data?.error
//    This gets the actual error message from the backend.
//
// 3. TYPE MAPPING:
//    Sometimes frontend and backend types don't match exactly.
//    Map the data to the expected shape in the store.
//
// 4. REFRESH PATTERN:
//    After mutations (borrow, return, update), refresh the list
//    to show the updated data.
// =============================================================================