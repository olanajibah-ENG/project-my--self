// src/components/Lessons/VideoViewer.tsx
import React, { useEffect, useState } from 'react';
import { LessonService } from '../../services/lesson.service';
import { useLanguage } from '../../contexts/LanguageContext';
import './VideoViewer.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lessonId: number;
  lessonTitle: string;
}

export const VideoViewer: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  lessonId, 
  lessonTitle 
}) => {
  const { t, isRTL } = useLanguage();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && lessonId) {
      loadVideo();
    }
  }, [isOpen, lessonId]);

  const loadVideo = async () => {
    setIsLoading(true);
    try {
      const data = await LessonService.getLessonVideo(lessonId);
      setVideoUrl(data.video_file);
      playSound();
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const playSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OihUBELTqjj8bllHAU2jdXwyXcsBS2A0PLaizsKG2m98OmiURAMUKXh8bllHAU3jtbwyXYrBSuCz/HajDkIG2i76+ifTxALTqfi8LdlGwU5j9XwxnQpBSqBzvHaizsIHGm87emhURARTqXg8LZkHAU4j9TwyHUrBSuBzvLajDcIGmi87+mjVBAMUKXg8bhlHQY5j9TwyHMrBSqBz/HajDgIG2m87+mjTxALT6Xi8L');
    audio.play().catch(() => {});
  };

  if (!isOpen) return null;

  return (
    <div className="video-overlay" onClick={onClose}>
      <div className={`video-modal ${isRTL ? 'rtl' : 'ltr'}`} onClick={(e) => e.stopPropagation()}>
        <div className="video-header">
          <div className="video-title">
            <span className="video-icon">🎥</span>
            <h2>{lessonTitle}</h2>
          </div>
          <button className="video-close" onClick={onClose}>✕</button>
        </div>

        <div className="video-content">
          {isLoading ? (
            <div className="video-loading">
              <div className="loading-spinner"></div>
              <p>{t.lessons.messages.loadingVideo}</p>
            </div>
          ) : videoUrl ? (
            <div className="video-wrapper">
              <video
                controls
                controlsList="nodownload"
                className="video-player"
                autoPlay
              >
                <source src={videoUrl} type="video/mp4" />
                {t.lessons.messages.noVideo}
              </video>
            </div>
          ) : (
            <div className="video-empty">
              <div className="empty-icon">🎬</div>
              <p>{t.lessons.messages.noVideo}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};