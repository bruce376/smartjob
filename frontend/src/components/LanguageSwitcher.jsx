import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  useEffect(() => {
    // Load saved language from localStorage on mount
    const savedLanguage = localStorage.getItem('language') || 'en';
    if (savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
      setCurrentLang(savedLanguage);
    }

    // Listen for language changes
    const handleLanguageChanged = (lng) => {
      setCurrentLang(lng);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const handleLanguageChange = (languageCode) => {
    console.log('Changing language to:', languageCode);
    i18n.changeLanguage(languageCode);
    localStorage.setItem('language', languageCode);
    setCurrentLang(languageCode);
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  return (
    <div className="language-switcher">
      <button className="language-trigger">
        <Globe className="w-4 h-4" />
        <span className="language-text">
          <span className="language-flag">{currentLanguage.flag}</span>
          <span className="language-name hidden sm:inline">{currentLanguage.name}</span>
        </span>
        <ChevronDown className="w-4 h-4 language-arrow" />
      </button>
      
      <div className="language-dropdown">
        <div className="language-list">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`language-option ${
                currentLang === language.code ? 'active' : ''
              }`}
            >
              <span className="language-option-flag">{language.flag}</span>
              <span className="language-option-name">{language.name}</span>
              {currentLang === language.code && (
                <svg className="language-option-check" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
