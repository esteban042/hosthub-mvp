import React from 'react';
import { useTranslation } from 'react-i18next';

const Hero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div 
      className="relative text-charcoal overflow-hidden bg-transparent"
      style={{
        backgroundImage: 'url(/images/hero.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center', 
        minHeight: '70vh' 
      }}
    >
      <div className="container mx-auto px-25 py-24 sm:py-24 flex items-center h-full">
        <div className="text-left px-10">
          <h1 className="text-4xl sm:text-6xl px-14 py-20 font-serif tracking-tight leading-loose">
            {t('landing_page.search.title1')} <br />
            <span>{t('landing_page.search.title2')}</span>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Hero;
