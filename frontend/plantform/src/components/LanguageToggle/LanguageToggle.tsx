// src/components/LanguageToggle/LanguageToggle.tsx
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './LanguageToggle.css';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, isRTL } = useLanguage();

  const toggleLanguage = () => {
    // Play sound effect
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OihUBELTqjj8bllHAU2jdXwyXcsBS2A0PLaizsKG2m98OmiURAMUKXh8bllHAU3jtbwyXYrBSuCz/HajDkIG2i76+ifTxALTqfi8LdlGwU5j9XwxnQpBSqBzvHaizsIHGm87emhURARTqXg8LZkHAU4j9TwyHUrBSuBzvLajDcIGmi87+mjVBAMUKXg8bhlHQY5j9TwyHMrBSqBz/HajDgIG2m87+mjTxALT6Xi8L');
    audio.play().catch(() => {});
    
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <button 
      className={`language-toggle ${isRTL ? 'rtl' : 'ltr'}`}
      onClick={toggleLanguage}
      title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <div className="toggle-container">
        <div className={`toggle-slider ${language === 'ar' ? 'arabic' : 'english'}`}>
          <span className="flag-icon">
            {language === 'ar' ? '🇸🇦' : '🇺🇸'}
          </span>
        </div>
        <div className="language-labels">
          <span className={`lang-label ${language === 'ar' ? 'active' : ''}`}>ع</span>
          <span className={`lang-label ${language === 'en' ? 'active' : ''}`}>EN</span>
        </div>
      </div>
    </button>
  );
};