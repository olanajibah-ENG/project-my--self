import api from './api';
import type { Book, BookFormData } from '../types/book.types';

export const booksService = {
  getBooks: async () => {
    const response = await api.get<Book[]>('/api/books/');
    return response.data;
  },

  addBook: async (bookData: BookFormData) => {
    // إرسال البيانات للـ POST
    const response = await api.post<Book>('/api/books/', bookData);
    return response.data;
  },

  updateBook: async (id: number, bookData: Partial<BookFormData>) => {
    // إرسال البيانات للـ PUT مع الـ id
    const response = await api.put<Book>(`/api/books/${id}/`, bookData);
    return response.data;
  },

  deleteBook: async (id: number) => {
    // طلب الحذف DELETE
    const response = await api.delete(`/api/books/${id}/`);
    return response.data;
  }
};