// src/components/auth/LogoutButton.tsx
import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { studentTranslations } from '../../locales/studentTranslations';
import './LogoutButton.css';

interface LogoutButtonProps {
  onLogout?: () => void;
  showConfirmation?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  onLogout, 
  showConfirmation = true 
}) => {
  const { language, isRTL } = useLanguage();
  const t = studentTranslations[language];
  const [showModal, setShowModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const playSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77OihUBELTqjj8bllHAU2jdXwyXcsBS2A0PLaizsKG2m98OmiURAMUKXh8bllHAU3jtbwyXYrBSuCz/HajDkIG2i76+ifTxALTqfi8LdlGwU5j9XwxnQpBSqBzvHaizsIHGm87emhURARTqXg8LZkHAU4j9TwyHUrBSuBzvLajDcIGmi87+mjVBAMUKXg8bhlHQY5j9TwyHMrBSqBz/HajDgIG2m87+mjTxALT6Xi8L');
    audio.play().catch(() => {});
  };

  const handleLogoutClick = () => {
    playSound();
    if (showConfirmation) {
      setShowModal(true);
    } else {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Clear localStorage
      localStorage.removeItem('plantform-token');
      localStorage.removeItem('plantform-user');
      
      // Call custom logout handler if provided
      if (onLogout) {
        await onLogout();
      } else {
        // Default behavior - redirect to login
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setShowModal(false);
    }
  };

  const handleCancel = () => {
    playSound();
    setShowModal(false);
  };

  return (
    <>
      <button 
        className={`logout-button ${isRTL ? 'rtl' : 'ltr'}`}
        onClick={handleLogoutClick}
        disabled={isLoggingOut}
        title={t.logout}
      >
        <div className="logout-content">
          <span className="logout-icon">🚪</span>
          <span className="logout-text">{t.logout}</span>
          <div className="logout-ripple"></div>
        </div>
      </button>

      {showModal && (
        <div className="logout-modal-overlay">
          <div className={`logout-modal ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="modal-header">
              <span className="modal-icon">⚠️</span>
              <h3>{t.logout}</h3>
            </div>
            <div className="modal-body">
              <p>{language === 'ar' ? 'هل أنت متأكد من تسجيل الخروج؟' : 'Are you sure you want to logout?'}</p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={handleCancel}
                disabled={isLoggingOut}
              >
                {t.cancel}
              </button>
              <button 
                className="btn-confirm"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    {language === 'ar' ? 'جاري تسجيل الخروج...' : 'Logging out...'}
                  </>
                ) : (
                  t.confirm
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};