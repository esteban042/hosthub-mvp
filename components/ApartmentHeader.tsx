import React, { useState } from 'react';
import { Apartment } from '../types';
import { CORE_ICONS } from '../constants';

interface ApartmentHeaderProps {
  apartment: Apartment;
  onBack: () => void;
}

const ApartmentHeader: React.FC<ApartmentHeaderProps> = ({ apartment, onBack }) => {
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

  const nextPhoto = () => setCurrentPhotoIdx((prev) => (prev + 1) % apartment.photos.length);
  const prevPhoto = () => setCurrentPhotoIdx((prev) => (prev - 1 + apartment.photos.length) % apartment.photos.length);

  return (
    <>
      <button onClick={onBack} className="flex items-center space-x-2 text-charcoal hover:text-sky-accent transition-colors mb-10 group">
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal">Return</span>
      </button>

      {/* Hero Image Section */}
      <div className="relative w-full h-[60vh] rounded-3xl overflow-hidden mb-12 shadow-2xl border border-stone-200">
        <img src={apartment.photos[currentPhotoIdx]} className="w-full h-full object-cover transition-opacity duration-1000" alt={apartment.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />

        {apartment.photos.length > 1 && (
          <>
            <button onClick={prevPhoto} className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-alabaster/40 backdrop-blur-md flex items-center justify-center text-charcoal hover:bg-alabaster/60 transition-all border border-charcoal/10 z-10">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={nextPhoto} className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-alabaster/40 backdrop-blur-md flex items-center justify-center text-charcoal hover:bg-alabaster/60 transition-all border border-charcoal/10 z-10">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}

        <div className="absolute bottom-8 left-10 right-10">
          <h1 className="text-4xl md:text-6xl text-white font-serif font-bold mb-2 tracking-tight drop-shadow-2xl">{apartment.title}</h1>
          <div className="flex items-center space-x-2 text-white/80">
            <div className="text-sky-accent">{CORE_ICONS.Location("w-5 h-5")}</div>
            <span className="text-base font-medium tracking-wide">{apartment.city}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApartmentHeader;
