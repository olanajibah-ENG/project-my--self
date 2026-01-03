import { create } from 'zustand';
import { transactionsService } from '../services/transactionsService';
import type { Transaction, BorrowFormData, TransactionsState } from '../types/transaction.types';

interface TransactionsStore extends TransactionsState {
  borrowBook: (borrowData: BorrowFormData) => Promise<Transaction>;
  fetchMyBorrows: () => Promise<void>;
  clearError: () => void;
}

export const useTransactionsStore = create<TransactionsStore>((set) => ({
  transactions: [],
  myBorrows: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalTransactions: 0,
  filterStatus: 'all',

  borrowBook: async (borrowData) => {
    set({ isLoading: true, error: null });
    try {
      const newTransaction = await transactionsService.borrowBook(borrowData);
      set((state) => ({
        myBorrows: [newTransaction, ...state.myBorrows],
        isLoading: false
      }));
      return newTransaction;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  fetchMyBorrows: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await transactionsService.getMyBorrows();
      set({ myBorrows: data, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  clearError: () => set({ error: null })
}));