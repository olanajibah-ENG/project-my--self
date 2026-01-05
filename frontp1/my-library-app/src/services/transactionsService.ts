// =============================================================================
// 💳 TRANSACTIONS SERVICE - API calls for borrow/return operations
// =============================================================================
// 
// ✅ COMPLETE IMPLEMENTATION with all endpoints:
//    - borrowBook: POST /api/borrow/<id>/
//    - returnBook: POST /api/return/<id>/
//    - getMyBorrows: GET /api/my-borrows/
//    - getAllTransactions: GET /api/transactions/ (Admin)
//    - updateTransaction: PATCH /api/transactions/<id>/ (Admin)
//    - extendBorrow: POST /api/transactions/<id>/extend/ (Admin)
// =============================================================================

import api from './api';

// Type for transaction (matches TransactionSerializer)
export interface BorrowTransaction {
  id: number;
  user_id: number;
  user_username: string;
  user_email: string;
  book_id: number;
  book_title: string;
  book_author: string;
  book_cover: string | null;
  action_type: 'borrow' | 'return';
  date: string;
  expected_return_date: string | null;  // ✅ NEW: From backend
}

// Type for simple message response
interface MessageResponse {
  msg: string;
}

// Type for update/extend response
interface UpdateResponse {
  msg: string;
  status?: string;
  new_return_date?: string;
}

export const transactionsService = {
  // =================================================================
  // USER ENDPOINTS
  // =================================================================

  /**
   * Borrow a book
   * 
   * POST /api/borrow/<book_id>/
   * 
   * ⚠️ FIX: Backend only needs book_id in the URL, no body needed!
   */
  borrowBook: async (bookId: number): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>(`/borrow/${bookId}/`);
    return response.data;
  },

  /**
   * Return a book
   * 
   * POST /api/return/<book_id>/
   */
  returnBook: async (bookId: number): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>(`/return/${bookId}/`);
    return response.data;
  },

  /**
   * Get user's borrowed books
   * 
   * GET /api/my-borrows/
   */
  getMyBorrows: async (): Promise<BorrowTransaction[]> => {
    const response = await api.get<BorrowTransaction[]>('/my-borrows/');
    return response.data;
  },

  // =================================================================
  // ⚠️ NEW: ADMIN ENDPOINTS
  // =================================================================

  /**
   * Get all transactions (Admin only)
   * 
   * GET /api/transactions/
   * 
   * 💡 This requires is_staff=true on the authenticated user.
   *    The backend checks this and returns 403 if not admin.
   */
  getAllTransactions: async (): Promise<BorrowTransaction[]> => {
    const response = await api.get<BorrowTransaction[]>('/transactions/');
    return response.data;
  },

  /**
   * Get a single transaction (Admin only)
   * 
   * GET /api/transactions/<transaction_id>/
   */
  getTransaction: async (transactionId: number): Promise<BorrowTransaction> => {
    const response = await api.get<BorrowTransaction>(`/transactions/${transactionId}/`);
    return response.data;
  },

  /**
   * Update transaction status (Admin only)
   * 
   * PATCH /api/transactions/<transaction_id>/
   * 
   * 💡 LEARNING: PATCH vs PUT
   *    - PUT: Replace the entire resource
   *    - PATCH: Update only specific fields
   *    For updating just status, PATCH is appropriate.
   */
  updateTransaction: async (
    transactionId: number,
    data: { status: 'active' | 'returned' | 'overdue' }
  ): Promise<UpdateResponse> => {
    const response = await api.patch<UpdateResponse>(
      `/transactions/${transactionId}/`,
      data
    );
    return response.data;
  },

  /**
   * Extend borrow period (Admin only)
   * 
   * POST /api/transactions/<transaction_id>/extend/
   * 
   * 💡 URL DESIGN: Actions on a resource are often sub-paths
   *    /transactions/5/ → the transaction
   *    /transactions/5/extend/ → action on that transaction
   */
  extendBorrow: async (
    transactionId: number,
    newReturnDate: string
  ): Promise<UpdateResponse> => {
    const response = await api.post<UpdateResponse>(
      `/transactions/${transactionId}/extend/`,
      { new_return_date: newReturnDate }
    );
    return response.data;
  }
};

// =============================================================================
// 💡 LEARNING POINTS:
// =============================================================================
// 
// 1. TYPE SAFETY: Always define response types for API calls.
//    api.get<MyType>() tells TypeScript what to expect.
//
// 2. REST CONVENTIONS:
//    - GET for reading data
//    - POST for creating or triggering actions
//    - PATCH for partial updates
//    - DELETE for removing
//
// 3. ERROR HANDLING:
//    Errors are handled by the axios interceptor in api.ts
//    The store should catch and handle any thrown errors.
// =============================================================================