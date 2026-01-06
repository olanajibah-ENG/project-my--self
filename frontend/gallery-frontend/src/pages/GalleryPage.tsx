import { useState, useEffect } from 'react';
import type { Album } from '../types/index';
import { galleryService } from '../services/galleryService';
import AlbumCreate from '../components/AlbumCreate';
import PhotoUpload from '../components/PhotoUpload';
import PhotoGrid from '../components/PhotoGrid';
import './GalleryPage.css';

const GalleryPage = () => {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAlbums = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await galleryService.getAlbums();
            setAlbums(response.data);
        } catch (err: any) {
            setError('حدث خطأ أثناء جلب البيانات');
            console.error('Error fetching albums:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlbums();
    }, []);

    const handleAlbumCreated = () => {
        fetchAlbums();
    };

    const handlePhotoUploaded = () => {
        fetchAlbums();
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">جاري التحميل...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <h3 className="error-title">حدث خطأ</h3>
                <p className="error-message">{error}</p>
                <button onClick={fetchAlbums} className="retry-btn">
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="gallery-page">
            <div className="gallery-header">
                <h1 className="page-title">
                    <span className="title-icon">🎨</span>
                    معرض الصور
                </h1>
                <p className="page-subtitle">أنشئ ألبوماتك وشارك ذكرياتك الجميلة</p>
            </div>

            <div className="gallery-content">
                <div className="actions-section">
                    <AlbumCreate onAlbumCreated={handleAlbumCreated} />
                    <PhotoUpload albums={albums} onPhotoUploaded={handlePhotoUploaded} />
                </div>

                <div className="grid-section">
                    <PhotoGrid albums={albums} />
                </div>
            </div>
        </div>
    );
};

export default GalleryPage;

