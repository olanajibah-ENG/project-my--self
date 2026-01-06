import { useState, useEffect } from 'react';
import { galleryService } from '../services/galleryService';
import type { Album } from '../types/index';
import './PhotoUpload.css';

interface PhotoUploadProps {
    albums: Album[];
    onPhotoUploaded: () => void;
}

const PhotoUpload = ({ albums, onPhotoUploaded }: PhotoUploadProps) => {
    const [selectedAlbum, setSelectedAlbum] = useState<number | ''>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null);
        }
    }, [selectedFile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setSelectedFile(file);
                setError(null);
            } else {
                setError('الرجاء اختيار ملف صورة صحيح');
                setSelectedFile(null);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAlbum) {
            setError('الرجاء اختيار ألبوم');
            return;
        }

        if (!selectedFile) {
            setError('الرجاء اختيار صورة');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const formData = new FormData();
            formData.append('album', selectedAlbum.toString());
            formData.append('image', selectedFile);
            formData.append('caption', caption);

            await galleryService.uploadPhoto(formData);
            setSuccess(true);
            
            // إعادة تعيين الحقول
            setSelectedAlbum('');
            setSelectedFile(null);
            setCaption('');
            setPreview(null);
            
            // إعادة جلب البيانات بعد رفع الصورة
            setTimeout(() => {
                onPhotoUploaded();
                setSuccess(false);
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'حدث خطأ أثناء رفع الصورة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="photo-upload-container">
            <div className="photo-upload-card">
                <h2 className="photo-upload-title">
                    <span className="icon">📸</span>
                    رفع صورة جديدة
                </h2>

                <form onSubmit={handleSubmit} className="photo-upload-form">
                    <div className="form-group">
                        <label className="form-label">اختر الألبوم</label>
                        <select
                            value={selectedAlbum}
                            onChange={(e) => setSelectedAlbum(Number(e.target.value) || '')}
                            className="album-select"
                            disabled={loading || albums.length === 0}
                        >
                            <option value="">-- اختر ألبوم --</option>
                            {albums.map((album) => (
                                <option key={album.id} value={album.id}>
                                    {album.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">اختر الصورة</label>
                        <div className="file-upload-wrapper">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="file-input"
                                id="file-upload"
                                disabled={loading}
                            />
                            <label htmlFor="file-upload" className="file-label">
                                <span className="file-icon">📁</span>
                                <span className="file-text">
                                    {selectedFile ? selectedFile.name : 'اختر ملف صورة'}
                                </span>
                                <span className="file-button">تصفح</span>
                            </label>
                        </div>
                        {preview && (
                            <div className="preview-container">
                                <img src={preview} alt="Preview" className="preview-image" />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">الوصف (اختياري)</label>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="أدخل وصف للصورة..."
                            className="caption-textarea"
                            rows={3}
                            disabled={loading}
                        />
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
                            تم رفع الصورة بنجاح!
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`submit-btn ${loading ? 'loading' : ''}`}
                        disabled={loading || albums.length === 0}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                جاري الرفع...
                            </>
                        ) : (
                            <>
                                <span className="btn-icon">☁️</span>
                                رفع الصورة
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PhotoUpload;

