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
      <div className="container mx-auto px-25 py-24 sm:py-24 flex items-center h-full">
        <div className="text-left px-10">
          <h1 className="text-4xl sm:text-6xl px-10 font-serif tracking-tight">
            Own your visibility <br />
            <span className=" py-28">Own your guests</span>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Hero;
