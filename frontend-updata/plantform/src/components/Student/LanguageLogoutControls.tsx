// src/components/Student/LanguageLogoutControls.tsx
import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { studentTranslations } from '../../locales/studentTranslations';
import './LanguageLogoutControls.css';

interface Props {
  onLogout: () => void;
}

export const LanguageLogoutControls: React.FC<Props> = ({ onLogout }) => {
  const { language, toggleLanguage, isRTL } = useLanguage();
  const t = studentTranslations[language];
  const [isAnimating, setIsAnimating] = useState(false);

  const playSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OihUBELTqjj8bllHAU2jdXwyXcsBS2A0PLaizsKG2m98OmiURAMUKXh8bllHAU3jtbwyXYrBSuCz/HajDkIG2i76+ifTxALTqfi8LdlGwU5j9XwxnQpBSqBzvHaizsIHGm87emhURARTqXg8LZkHAU4j9TwyHUrBSuBzvLajDcIGmi87+mjVBAMUKXg8bhlHQY5j9TwyHMrBSqBz/HajDgIG2m87+mjTxALT6Xi8L');
    audio.play().catch(() => {});
  };

  const handleLanguageToggle = () => {
    setIsAnimating(true);
    playSound();
    toggleLanguage();
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  const handleLogout = () => {
    playSound();
    const confirmLogout = window.confirm(
      language === 'ar' 
        ? 'هل أنت متأكد من تسجيل الخروج؟' 
        : 'Are you sure you want to logout?'
    );
    
    if (confirmLogout) {
      onLogout();
    }
  };

  return (
    <div className={`language-logout-controls ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Language Toggle */}
      <div className="language-toggle-container">
        <button
          className={`language-toggle ${isAnimating ? 'animating' : ''}`}
          onClick={handleLanguageToggle}
          title={t.switchLanguage}
        >
          <div className="language-toggle-track">
            <div className={`language-toggle-thumb ${language === 'en' ? 'active' : ''}`}>
              <span className="language-flag">
                {language === 'ar' ? '🇸🇦' : '🇺🇸'}
              </span>
            </div>
          </div>
          <div className="language-labels">
            <span className={`language-label ${language === 'ar' ? 'active' : ''}`}>
              {t.arabic}
            </span>
            <span className={`language-label ${language === 'en' ? 'active' : ''}`}>
              {t.english}
            </span>
          </div>
        </button>
      </div>

      {/* Logout Button */}
      <button
        className="logout-button"
        onClick={handleLogout}
        title={t.logout}
      >
        <span className="logout-icon">🚪</span>
        <span className="logout-text">
          {t.logout}
        </span>
      </button>
    </div>
  );
};