
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const node = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (node.current?.contains(e.target as Node)) {
      // inside click
      return;
    }
    // outside click 
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getButtonClasses = (lang: string) => {
    const isActive = i18n.language.startsWith(lang);
    return `w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
      isActive ? 'bg-stone-200/10 font-semibold' : 'hover:bg-stone-100/10'
    }`;
  };

  return (
    <div ref={node} className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full text-stone-500 hover:bg-stone-100/10 hover:text-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          id="options-menu"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <Globe className="h-5 w-5" />
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute mt-2 w-24 rounded-md shadow-lg bg-transparent ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in duration-200 origin-top-left md:origin-top-right left-0 md:left-auto md:right-0"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="py-1" role="none">
            <button onClick={() => handleLanguageChange('en')} className={getButtonClasses('en')} role="menuitem">
              EN
            </button>
            <button onClick={() => handleLanguageChange('es')} className={getButtonClasses('es')} role="menuitem">
              ES
            </button>
            <button onClick={() => handleLanguageChange('fr')} className={getButtonClasses('fr')} role="menuitem">
              FR
            </button>
            <button onClick={() => handleLanguageChange('de')} className={getButtonClasses('de')} role="menuitem">
              DE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
