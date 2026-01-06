import axios from 'axios';
import type { Album, Photo } from '../types/index';

const API = axios.create({
    baseURL: 'http://localhost:8000/api/',
});

export const galleryService = {
    // جلب كل الألبومات (GET)
    getAlbums: () => API.get<Album[]>('albums/'),

    // إنشاء ألبوم جديد (POST JSON)
    createAlbum: (title: string) => API.post<Album>('albums/', { title }),

    // رفع صورة (POST FormData)
    uploadPhoto: (formData: FormData) => API.post<Photo>('upload/', formData),
};

