import type { Album } from '../types/index';
import './PhotoGrid.css';

interface PhotoGridProps {
    albums: Album[];
}

const PhotoGrid = ({ albums }: PhotoGridProps) => {
    if (albums.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📷</div>
                <h3 className="empty-title">لا توجد ألبومات بعد</h3>
                <p className="empty-message">ابدأ بإنشاء ألبوم جديد ورفع بعض الصور!</p>
            </div>
        );
    }

    return (
        <div className="photo-grid-container">
            <h2 className="grid-title">
                <span className="title-icon">🖼️</span>
                معرض الصور
            </h2>
            <div className="albums-grid">
                {albums.map((album, index) => (
                    <div
                        key={album.id}
                        className="album-card"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="album-header">
                            <h3 className="album-title">{album.title}</h3>
                            <span className="album-date">
                                {new Date(album.created_at).toLocaleDateString('ar-SA')}
                            </span>
                        </div>

                        {album.photos.length > 0 ? (
                            <div className="photos-container">
                                <div className="photos-grid">
                                    {album.photos.map((photo) => (
                                        <div key={photo.id} className="photo-item">
                                            <div className="photo-wrapper">
                                                <img
                                                    src={`http://localhost:8000${photo.image}`}
                                                    alt={photo.caption || 'صورة'}
                                                    className="photo-image"
                                                    loading="lazy"
                                                />
                                                <div className="photo-overlay">
                                                    <p className="photo-caption">{photo.caption}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="photo-count">
                                    {album.photos.length} {album.photos.length === 1 ? 'صورة' : 'صورة'}
                                </div>
                            </div>
                        ) : (
                            <div className="empty-album">
                                <span className="empty-album-icon">📭</span>
                                <p className="empty-album-text">لا توجد صور في هذا الألبوم</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PhotoGrid;

