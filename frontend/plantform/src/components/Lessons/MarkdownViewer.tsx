// src/components/Lessons/MarkdownViewer.tsx
// Install: npm install react-markdown rehype-highlight remark-gfm
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { LessonService } from '../../services/lesson.service';
import { useLanguage } from '../../contexts/LanguageContext';
import './MarkdownViewer.css';
import 'highlight.js/styles/github-dark.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lessonId: number;
  lessonTitle: string;
}

export const MarkdownViewer: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  lessonId, 
  lessonTitle 
}) => {
  const { t, isRTL } = useLanguage();
  const [markdown, setMarkdown] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && lessonId) {
      loadMarkdown();
    }
  }, [isOpen, lessonId]);

  const loadMarkdown = async () => {
    setIsLoading(true);
    try {
      const data = await LessonService.getLessonMarkdown(lessonId);
      setMarkdown(data.content_markdown);
      playSound();
    } catch (error) {
      console.error('Error loading markdown:', error);
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
    <div className="markdown-overlay" onClick={onClose}>
      <div className={`markdown-modal ${isRTL ? 'rtl' : 'ltr'}`} onClick={(e) => e.stopPropagation()}>
        <div className="markdown-header">
          <div className="markdown-title">
            <span className="markdown-icon">📝</span>
            <h2>{lessonTitle}</h2>
          </div>
          <button className="markdown-close" onClick={onClose}>✕</button>
        </div>

        <div className="markdown-content">
          {isLoading ? (
            <div className="markdown-loading">
              <div className="loading-spinner"></div>
              <p>{t.lessons.messages.loadingContent}</p>
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              className="markdown-body"
            >
              {markdown}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
};