import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from './en.json';
import te from './te.json';
import hi from './hi.json';

const translations = {
  en,
  te,
  hi
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', flag: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳' }
];

const STORAGE_KEY = 'udyamone_language';

export const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key, fallbackOrParams, params) => {
    if (!key) return '';
    let fallback = typeof fallbackOrParams === 'string' ? fallbackOrParams : key;
    let interpolationParams = (params && typeof params === 'object') ? params : (typeof fallbackOrParams === 'object' ? fallbackOrParams : null);
    let val = getNestedValue(en, key);
    let result = val !== undefined ? val : fallback;
    if (interpolationParams && typeof result === 'string') {
      return interpolate(result, interpolationParams);
    }
    return result;
  },
  languages: SUPPORTED_LANGUAGES
});

function getNestedValue(obj, path) {
  if (!obj || typeof obj !== 'object') return undefined;
  if (path in obj) return obj[path];
  
  const parts = path.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr && typeof curr === 'object' && part in curr) {
      curr = curr[part];
    } else {
      return undefined;
    }
  }
  return curr;
}

function interpolate(template, params) {
  if (typeof template !== 'string' || !params || typeof params !== 'object') {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return key in params ? String(params[key]) : match;
  });
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && (saved === 'en' || saved === 'te' || saved === 'hi')) {
          return saved;
        }
      } catch (err) {
        console.warn('Unable to read language from localStorage:', err);
      }
    }
    return 'en';
  });

  const setLanguage = useCallback((newLang) => {
    if (newLang === 'en' || newLang === 'te' || newLang === 'hi') {
      setLanguageState(newLang);
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, newLang);
          document.documentElement.lang = newLang;
        }
      } catch (err) {
        console.warn('Unable to persist language to localStorage:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = useCallback((key, fallbackOrParams, params) => {
    if (!key) return '';

    let fallback = '';
    let interpolationParams = null;

    if (typeof fallbackOrParams === 'string') {
      fallback = fallbackOrParams;
      if (params && typeof params === 'object') {
        interpolationParams = params;
      }
    } else if (fallbackOrParams && typeof fallbackOrParams === 'object') {
      interpolationParams = fallbackOrParams;
    }

    const currentDict = translations[language] || translations.en;
    let value = getNestedValue(currentDict, key);

    // Fallback to English if not found in target language
    if (value === undefined && language !== 'en') {
      value = getNestedValue(translations.en, key);
    }

    if (value === undefined) {
      value = fallback || key;
    }

    if (interpolationParams && typeof value === 'string') {
      return interpolate(value, interpolationParams);
    }

    return value;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t,
    languages: SUPPORTED_LANGUAGES
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}

export const useLanguage = useTranslation;
