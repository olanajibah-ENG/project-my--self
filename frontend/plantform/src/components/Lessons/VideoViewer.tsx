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
  const [error, setError] = useState<string | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState(1.0);

  useEffect(() => {
    if (isOpen && lessonId) {
      loadVideo();
    }
  }, [isOpen, lessonId]);

  const loadVideo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🎥 Loading video for lesson:', lessonId);
      const data = await LessonService.getLessonVideo(lessonId);
      console.log('📹 Video data received:', data);
      
      if (data.video_file) {
        // إذا كان الرابط نسبي، أضف رابط الخادم
        let fullVideoUrl = data.video_file;
        if (!fullVideoUrl.startsWith('http')) {
          fullVideoUrl = `http://localhost:8000${fullVideoUrl}`;
        }
        console.log('🔗 Full video URL:', fullVideoUrl);
        setVideoUrl(fullVideoUrl);
        playSound();
      } else {
        setError('No video file found for this lesson');
      }
    } catch (error: any) {
      console.error('❌ Error loading video:', error);
      setError(error.response?.data?.message || 'Failed to load video');
    } finally {
      setIsLoading(false);
    }
  };

  const setVideoSpeed = (speed: number) => {
    const video = document.getElementById('lesson-video') as HTMLVideoElement;
    if (video) {
      video.playbackRate = speed;
      setCurrentSpeed(speed);
      console.log(`⚡ Video speed changed to: ${speed}x`);
    }
  };

  const seekVideo = (seconds: number) => {
    const video = document.getElementById('lesson-video') as HTMLVideoElement;
    if (video) {
      video.currentTime += seconds;
      console.log(`⏭️ Video seeked by: ${seconds}s`);
    }
  };

  const playSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OihUBELTqjj8bllHAU2jdXwyXcsBS2A0PLaizsKG2m98OmiURAMUKXh8bllHAU3jtbwyXYrBSuCz/HajDkIG2i76+ifTxALTqfi8LdlGwU5j9XwxnQpBSqBzvHaizsIHGm87emhURARTqXg8LZkHAU4j9TwyHUrBSuBzvLajDcIGmi87+mjVBAMUKXg8bhlHQY5j9TwyHMrBSqBz/HajDgIG2m87+mjTxALT6Xi8L');
    audio.play().catch(() => {});
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('🚫 Video playback error:', e);
    setError('Unable to play this video. The file may be corrupted or in an unsupported format.');
  };

  const handleVideoLoad = () => {
    console.log('✅ Video loaded successfully');
    setError(null);
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
          ) : error ? (
            <div className="video-error">
              <div className="error-icon">⚠️</div>
              <p className="error-message">{error}</p>
              <button className="retry-btn" onClick={loadVideo}>
                🔄 Try Again
              </button>
            </div>
          ) : videoUrl ? (
            <div className="video-wrapper">
              <video
                ref={(video) => {
                  if (video) {
                    // إعداد سرعات التشغيل المخصصة
                    video.playbackRate = 1.0;
                  }
                }}
                controls
                controlsList="nodownload"
                className="video-player"
                onError={handleVideoError}
                onLoadedData={handleVideoLoad}
                preload="metadata"
                id="lesson-video"
              >
                <source src={videoUrl} type="video/mp4" />
                <source src={videoUrl} type="video/webm" />
                <source src={videoUrl} type="video/ogg" />
                Your browser does not support the video tag.
              </video>
              
              {/* أزرار التحكم المخصصة */}
              <div className="video-controls">
                <div className="speed-controls">
                  <span className="control-label">⚡ السرعة:</span>
                  <button 
                    className={`speed-btn ${currentSpeed === 0.5 ? 'active' : ''}`}
                    onClick={() => setVideoSpeed(0.5)}
                    title="بطيء (0.5x)"
                  >
                    0.5x
                  </button>
                  <button 
                    className={`speed-btn ${currentSpeed === 0.75 ? 'active' : ''}`}
                    onClick={() => setVideoSpeed(0.75)}
                    title="بطيء (0.75x)"
                  >
                    0.75x
                  </button>
                  <button 
                    className={`speed-btn ${currentSpeed === 1.0 ? 'active' : ''}`}
                    onClick={() => setVideoSpeed(1.0)}
                    title="عادي (1x)"
                  >
                    1x
                  </button>
                  <button 
                    className={`speed-btn ${currentSpeed === 1.25 ? 'active' : ''}`}
                    onClick={() => setVideoSpeed(1.25)}
                    title="سريع (1.25x)"
                  >
                    1.25x
                  </button>
                  <button 
                    className={`speed-btn ${currentSpeed === 1.5 ? 'active' : ''}`}
                    onClick={() => setVideoSpeed(1.5)}
                    title="سريع (1.5x)"
                  >
                    1.5x
                  </button>
                  <button 
                    className={`speed-btn ${currentSpeed === 2.0 ? 'active' : ''}`}
                    onClick={() => setVideoSpeed(2.0)}
                    title="سريع جداً (2x)"
                  >
                    2x
                  </button>
                </div>
                
                <div className="seek-controls">
                  <span className="control-label">⏭️ التنقل:</span>
                  <button 
                    className="seek-btn" 
                    onClick={() => seekVideo(-10)}
                    title="رجوع 10 ثواني"
                  >
                    ⏪ -10s
                  </button>
                  <button 
                    className="seek-btn" 
                    onClick={() => seekVideo(-5)}
                    title="رجوع 5 ثواني"
                  >
                    ⏮️ -5s
                  </button>
                  <button 
                    className="seek-btn" 
                    onClick={() => seekVideo(5)}
                    title="تقديم 5 ثواني"
                  >
                    ⏭️ +5s
                  </button>
                  <button 
                    className="seek-btn" 
                    onClick={() => seekVideo(10)}
                    title="تقديم 10 ثواني"
                  >
                    ⏩ +10s
                  </button>
                </div>
              </div>
              
              <div className="video-info">
                <p className="video-url">📁 {videoUrl}</p>
              </div>
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