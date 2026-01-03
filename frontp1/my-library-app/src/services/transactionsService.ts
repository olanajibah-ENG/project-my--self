import api, { apiHelpers } from './api';
import type { Transaction, BorrowFormData } from '../types/transaction.types';

export const transactionsService = {
  // دالة الاستعارة المعدلة لتربط مع الرابط /api/borrow/{id}/
  async borrowBook(borrowData: BorrowFormData): Promise<Transaction> {
    try {
      const { bookId, expectedReturnDate, notes } = borrowData;
      
      // Convert bookId to number if it's a string
      const bookIdNum = typeof bookId === 'string' ? parseInt(bookId, 10) : bookId;
      
      // Validate bookId
      if (isNaN(bookIdNum) || bookIdNum <= 0) {
        throw new Error('Invalid book ID');
      }
      
      // Convert date to ISO format if needed (backend might expect datetime, not just date)
      // Try both formats: first as-is (date only), if that fails, try ISO datetime
      let formattedDate = expectedReturnDate;
      
      // If date is in YYYY-MM-DD format, convert to ISO datetime (YYYY-MM-DDTHH:mm:ss)
      if (/^\d{4}-\d{2}-\d{2}$/.test(expectedReturnDate)) {
        // Keep as date only first, backend might accept it
        formattedDate = expectedReturnDate;
        // Alternative: formattedDate = `${expectedReturnDate}T00:00:00`;
      }
      
      // Prepare request body - only include notes if it exists and is not empty
      const requestBody: any = {
        expected_return_date: formattedDate
      };
      
      // Only add notes if it exists and is not empty
      if (notes && notes.trim() !== '') {
        requestBody.notes = notes.trim();
      }
      
      console.log('📤 Borrow Book Request:', {
        url: `/borrow/${bookIdNum}/`,
        bookId: bookIdNum,
        body: requestBody,
        expectedReturnDate: expectedReturnDate
      });
      
      // إرسال طلب POST إلى الرابط الموضح في Postman (مثل /api/borrow/5/)
      const response = await api.post(`/borrow/${bookIdNum}/`, requestBody);
      
      console.log('✅ Borrow Book Response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Borrow Book Error:', {
        error: error,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Provide more detailed error message
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          throw new Error(errorData);
        } else if (errorData.detail) {
          throw new Error(errorData.detail);
        } else if (errorData.message) {
          throw new Error(errorData.message);
        } else if (errorData.error) {
          throw new Error(errorData.error);
        } else if (typeof errorData === 'object') {
          // Try to extract error messages from validation errors
          const errorMessages = Object.values(errorData).flat();
          throw new Error(errorMessages.join(', ') || 'Validation error');
        }
      }
      
      throw new Error(apiHelpers.handleApiError(error));
    }
  },

  // جلب سجل استعارات المستخدم الحالي
  async getMyBorrows(): Promise<Transaction[]> {
    try {
      // لاحظ: تأكد من أن هذا المسار صحيح في الباك آند لديك
      const response = await api.get('/transactions/my-borrows');
      return response.data;
    } catch (error) {
      throw new Error(apiHelpers.handleApiError(error));
    }
  }
};