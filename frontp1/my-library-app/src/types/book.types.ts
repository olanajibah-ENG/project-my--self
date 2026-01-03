export interface Book {
  id: number; // غيرناه لـ number ليتناسب مع الـ Postman عندك (id: 6)
  title: string;
  author: string;
  quantity: number; // الاسم الجديد ليطابق الـ API
  cover_image: string | null; // الاسم الجديد ليطابق الـ API
  availableQuantity?: number;
}

export interface BookFormData {
  title: string;
  author: string;
  quantity: number;
  cover_image?: string;
}