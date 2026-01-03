export interface Transaction {
  id: number;
  bookId: number;
  userId: number;
  borrowDate: string;
  expected_return_date: string; // تم التعديل ليطابق الـ API
  status: 'active' | 'returned' | 'overdue';
  notes?: string;
}

export interface BorrowFormData {
  bookId: string | number;
  expectedReturnDate: string; // سنحولها عند الإرسال لـ expected_return_date
  notes?: string;
}


export interface ReturnFormData {
  transactionId: string;
  returnDate: string;
  notes?: string;
}

export interface TransactionsState {
  transactions: Transaction[];
  myBorrows: Transaction[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalTransactions: number;
  filterStatus: 'all' | 'active' | 'returned' | 'overdue';
}

export interface TransactionStats {
  totalBorrows: number;
  activeBorrows: number;
  overdueBorrows: number;
  returnedThisMonth: number;
  popularBooks: Array<{
    bookId: string;
    title: string;
    borrowCount: number;
  }>;
}
