export interface Photo {
    id: number;
    album: number;
    image: string; // رابط الصورة القادم من Django
    caption: string;
}

export interface Album {
    id: number;
    title: string;
    photos: Photo[];
    created_at: string;
}

