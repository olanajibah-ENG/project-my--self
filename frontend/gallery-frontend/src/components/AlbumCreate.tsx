import { useState } from 'react';
import { galleryService } from '../services/galleryService';
import './AlbumCreate.css';

interface AlbumCreateProps {
    onAlbumCreated: () => void;
}

const AlbumCreate = ({ onAlbumCreated }: AlbumCreateProps) => {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title.trim()) {
            setError('الرجاء إدخال عنوان الألبوم');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await galleryService.createAlbum(title);
            setSuccess(true);
            setTitle('');
            
            // إعادة جلب البيانات بعد إنشاء الألبوم
            setTimeout(() => {
                onAlbumCreated();
                setSuccess(false);
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'حدث خطأ أثناء إنشاء الألبوم');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="album-create-container">
            <div className="album-create-card">
                <h2 className="album-create-title">
                    <span className="icon">📁</span>
                    إنشاء ألبوم جديد
                </h2>
                
                <form onSubmit={handleSubmit} className="album-create-form">
                    <div className="input-group">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="أدخل عنوان الألبوم..."
                            className="album-input"
                            disabled={loading}
                        />
                        <div className="input-underline"></div>
                    </div>

                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="success-message">
                            <span className="success-icon">✓</span>
                            تم إنشاء الألبوم بنجاح!
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`submit-btn ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                جاري الإنشاء...
                            </>
                        ) : (
                            <>
                                <span className="btn-icon">✨</span>
                                إنشاء الألبوم
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AlbumCreate;

