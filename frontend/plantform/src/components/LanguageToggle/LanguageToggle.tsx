// src/components/LanguageToggle/LanguageToggle.tsx
import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './LanguageToggle.css';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);

  const playSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OihUBELTqjj8bllHAU2jdXwyXcsBS2A0PLaizsKG2m98OmiURAMUKXh8bllHAU3jtbwyXYrBSuCz/HajDkIG2i76+ifTxALTqfi8LdlGwU5j9XwxnQpBSqBzvHaizsIHGm87emhURARTqXg8LZkHAU4j9TwyHUrBSuBzvLajDcIGmi87+mjVBAMUKXg8bhlHQY5j9TwyHMrBSqBz/HajDgIG2m87+mjTxALT6Xi8L');
    audio.play().catch(() => {});
  };

  const handleToggle = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    playSound();
    
    const newLanguage = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLanguage);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="language-toggle-container">
      <button
        className={`language-toggle ${isAnimating ? 'animating' : ''}`}
        onClick={handleToggle}
        title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      >
        <div className="toggle-track">
          <div className={`toggle-thumb ${language === 'en' ? 'active' : ''}`}>
            <span className="toggle-icon">
              {language === 'ar' ? '🌙' : '☀️'}
            </span>
          </div>
        </div>
        
        <div className="language-labels">
          <span className={`lang-label ${language === 'ar' ? 'active' : ''}`}>
            عربي
          </span>
          <span className={`lang-label ${language === 'en' ? 'active' : ''}`}>
            EN
          </span>
        </div>
      </button>
    </div>
  );
};