// =============================================================================
// 💳 TRANSACTION TYPES
// =============================================================================
// 
// ⚠️ ISSUE FOUND: TransactionCard expects nested book/user objects
//    but the old type only had flat fields.
// 
// ✅ FIX: Add nested book/user properties for admin display.
// =============================================================================

export interface Transaction {
  id: number;
  bookId: number;
  userId: number;
  borrowDate: string;
  expected_return_date: string;
  expectedReturnDate?: string;  // ✅ NEW: TransactionCard uses camelCase
  status: 'active' | 'returned' | 'overdue';
  notes?: string;
  actualReturnDate?: string;

  // ✅ NEW: Nested book object for TransactionCard display
  book?: {
    id?: number;
    title: string;
    author: string;
    coverImageUrl?: string;
  };

  // ✅ NEW: Nested user object for TransactionCard display
  user?: {
    id?: number;
    username: string;
    email?: string;
  };
}

export interface BorrowFormData {
  bookId: string | number;
  expectedReturnDate: string;
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
