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
      console.log('📝 Markdown loaded:', data.content_markdown?.substring(0, 100) + '...');
      setMarkdown(data.content_markdown);
      playSound();
    } catch (error) {
      console.error('Error loading markdown:', error);
      // إضافة محتوى تجريبي للاختبار
      setMarkdown(`# مرحباً بك في درس Markdown! 📚

## هذا عنوان فرعي 📖

### عنوان أصغر 📝

هذه **فقرة مهمة** تحتوي على نص *مائل* وبعض \`الكود المضمن\`.

#### قائمة العناصر:

- العنصر الأول ✨
- العنصر الثاني ✨  
- العنصر الثالث ✨

#### قائمة مرقمة:

1. الخطوة الأولى
2. الخطوة الثانية
3. الخطوة الثالثة

> هذا اقتباس مهم يحتوي على معلومات قيمة! 💡

\`\`\`javascript
// هذا مثال على الكود
function sayHello() {
  console.log("مرحباً بالعالم!");
}
\`\`\`

[رابط مفيد](https://example.com)

---

**ملاحظة:** هذا محتوى تجريبي لاختبار التنسيقات.`);
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
            <div className="markdown-body" style={{
              fontFamily: isRTL ? 'Cairo, sans-serif' : 'Inter, sans-serif',
              direction: isRTL ? 'rtl' : 'ltr'
            }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  // تخصيص العناصر مع inline styles لضمان التطبيق
                  h1: ({children}) => (
                    <h1 style={{
                      fontSize: '32px',
                      fontWeight: '800',
                      margin: '32px 0 20px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      borderBottom: '3px solid #ddd6fe',
                      paddingBottom: '12px',
                      position: 'relative'
                    }}>
                      📚 {children}
                    </h1>
                  ),
                  h2: ({children}) => (
                    <h2 style={{
                      fontSize: '26px',
                      fontWeight: '700',
                      margin: '28px 0 16px',
                      color: '#8b5cf6',
                      position: 'relative'
                    }}>
                      📖 {children}
                    </h2>
                  ),
                  h3: ({children}) => (
                    <h3 style={{
                      fontSize: '22px',
                      fontWeight: '600',
                      margin: '24px 0 12px',
                      color: '#a78bfa',
                      position: 'relative'
                    }}>
                      📝 {children}
                    </h3>
                  ),
                  h4: ({children}) => (
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      margin: '20px 0 10px',
                      color: '#c084fc',
                      position: 'relative'
                    }}>
                      ▶️ {children}
                    </h4>
                  ),
                  p: ({children}) => (
                    <p style={{
                      margin: '16px 0',
                      fontSize: '16px',
                      textAlign: 'justify',
                      lineHeight: '1.7',
                      color: '#1f2937'
                    }}>
                      {children}
                    </p>
                  ),
                  ul: ({children}) => (
                    <ul style={{
                      margin: '16px 0',
                      paddingRight: isRTL ? '32px' : '0',
                      paddingLeft: isRTL ? '0' : '32px',
                      listStyle: 'none'
                    }}>
                      {children}
                    </ul>
                  ),
                  ol: ({children}) => (
                    <ol style={{
                      margin: '16px 0',
                      paddingRight: isRTL ? '32px' : '0',
                      paddingLeft: isRTL ? '0' : '32px',
                      counterReset: 'item'
                    }}>
                      {children}
                    </ol>
                  ),
                  li: ({children, ...props}) => {
                    // Check if this li is inside an ol (ordered list) by checking if it has an index prop
                    const isOrdered = 'index' in props;
                    return (
                      <li style={{
                        position: 'relative',
                        margin: '12px 0',
                        fontSize: '16px',
                        paddingRight: isRTL ? (isOrdered ? '32px' : '24px') : '0',
                        paddingLeft: isRTL ? '0' : (isOrdered ? '32px' : '24px'),
                        counterIncrement: isOrdered ? 'item' : 'none'
                      }}>
                        {!isOrdered && (
                          <span style={{
                            position: 'absolute',
                            [isRTL ? 'right' : 'left']: '0',
                            top: '0',
                            color: '#8b5cf6'
                          }}>✨</span>
                        )}
                        {isOrdered && (
                          <span style={{
                            position: 'absolute',
                            [isRTL ? 'right' : 'left']: '0',
                            top: '0',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                            color: 'white',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}>
                            {/* سيتم إضافة الرقم تلقائياً */}
                          </span>
                        )}
                        {children}
                      </li>
                    );
                  },
                  code: ({children, className}) => {
                    const isInline = !className;
                    return isInline ? (
                      <code style={{
                        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontFamily: 'JetBrains Mono, Courier New, monospace',
                        fontSize: '14px',
                        color: '#ec4899',
                        border: '1px solid #d1d5db',
                        fontWeight: '600'
                      }}>
                        {children}
                      </code>
                    ) : (
                      <code className={className}>{children}</code>
                    );
                  },
                  pre: ({children}) => (
                    <pre style={{
                      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                      padding: '24px',
                      borderRadius: '16px',
                      overflowX: 'auto',
                      margin: '20px 0',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                      border: '1px solid #374151',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        [isRTL ? 'left' : 'right']: '16px',
                        background: 'rgba(139, 92, 246, 0.2)',
                        color: '#a78bfa',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        💻 Code
                      </div>
                      {children}
                    </pre>
                  ),
                  blockquote: ({children}) => (
                    <blockquote style={{
                      borderRight: isRTL ? '4px solid #8b5cf6' : 'none',
                      borderLeft: isRTL ? 'none' : '4px solid #8b5cf6',
                      padding: '20px 24px',
                      margin: '20px 0',
                      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                      borderRadius: '12px',
                      fontStyle: 'italic',
                      position: 'relative',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.1)'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        [isRTL ? 'left' : 'right']: '16px',
                        fontSize: '20px'
                      }}>
                        💡
                      </div>
                      <div style={{
                        margin: '0',
                        color: '#6b21a8',
                        fontWeight: '500'
                      }}>
                        {children}
                      </div>
                    </blockquote>
                  ),
                  strong: ({children}) => (
                    <strong style={{
                      fontWeight: '700',
                      color: '#7c3aed',
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {children}
                    </strong>
                  ),
                  em: ({children}) => (
                    <em style={{
                      fontStyle: 'italic',
                      color: '#a78bfa',
                      background: 'rgba(167, 139, 250, 0.1)',
                      padding: '1px 4px',
                      borderRadius: '3px'
                    }}>
                      {children}
                    </em>
                  ),
                  a: ({children, href}) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        color: '#8b5cf6',
                        textDecoration: 'none',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        const target = e.target as HTMLAnchorElement;
                        target.style.color = '#7c3aed';
                        target.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as HTMLAnchorElement;
                        target.style.color = '#8b5cf6';
                        target.style.textDecoration = 'none';
                      }}
                    >
                      {children}
                    </a>
                  ),
                  table: ({children}) => (
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      margin: '16px 0',
                      boxShadow: '0 2px 8px rgba(139, 92, 246, 0.1)',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}>
                      {children}
                    </table>
                  ),
                  th: ({children}) => (
                    <th style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                      color: 'white',
                      padding: '12px',
                      textAlign: isRTL ? 'right' : 'left',
                      fontWeight: '600'
                    }}>
                      {children}
                    </th>
                  ),
                  td: ({children}) => (
                    <td style={{
                      padding: '12px',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      {children}
                    </td>
                  ),
                  hr: () => (
                    <hr style={{
                      border: 'none',
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent, #ddd6fe, transparent)',
                      margin: '24px 0'
                    }} />
                  ),
                  img: ({src, alt}) => (
                    <img 
                      src={src} 
                      alt={alt}
                      style={{
                        maxWidth: '100%',
                        borderRadius: '12px',
                        margin: '16px 0',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  )
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};