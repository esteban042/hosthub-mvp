import React from 'react';

const Hero: React.FC = () => {
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
      <div className="container mx-auto px-6 py-16 sm:py-24 flex items-center h-full">
        <div className="text-left">
          <h1 className="text-4xl sm:text-6xl font-bold text-brand-green tracking-tight">
            Own your visibility. <br />
            <span className="text-charcoal">Own your guests.</span>
          </h1>
          <div className="mt-8 flex justify-start gap-4">
            <a href="#pricing" className="bg-brand-green text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-full transition-all text-xs sm:text-sm uppercase tracking-wider hover:bg-brand-green/90 active:scale-95">
              See Plans
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
