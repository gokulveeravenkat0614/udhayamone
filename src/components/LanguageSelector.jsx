import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../i18n/LanguageContext';

export function LanguageSelector({ variant = 'navbar', className = '' }) {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  // Mobile / compact variant
  if (variant === 'mobile') {
    return (
      <div className={`pt-2 pb-1 border-t border-slate-200 ${className}`}>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1 flex items-center space-x-1.5">
          <Globe className="w-3.5 h-3.5 text-brand-600" />
          <span>Language / భాష / भाषा</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                  isSelected
                    ? 'bg-brand-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                <span>{lang.nativeLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Top banner variant
  if (variant === 'topbar') {
    return (
      <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-colors cursor-pointer"
          title="Select Language / భాషను ఎంచుకోండి / भाषा चुनें"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <Globe className="w-3 h-3 text-brand-300" />
          <span className="font-semibold">{currentLang.nativeLabel}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-slate-800 animate-fadeIn">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-50 text-brand-700 font-bold' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.nativeLabel}</span>
                    {lang.code !== 'en' && (
                      <span className="text-[10px] text-slate-400 font-normal">({lang.label})</span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-600" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Default navbar variant - clearly visible in header/navbar:
  // English ▼ / తెలుగు ▼ / हिन्दी ▼
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-brand-800 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 transition-all cursor-pointer shadow-2xs select-none"
        title="Change Language / భాష / भाषा"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-brand-600 shrink-0" />
        <span className="tracking-tight">{currentLang.nativeLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
          <div className="px-3.5 py-1.5 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Language / భాష / भाषा
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                  isSelected ? 'bg-blue-50/80 text-brand-700 font-bold' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-base">{lang.flag}</span>
                  <div>
                    <div className="font-bold leading-tight">{lang.nativeLabel}</div>
                    {lang.code !== 'en' && (
                      <div className="text-[10px] text-slate-400 font-medium">{lang.label}</div>
                    )}
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
