import React, { useState } from 'react';
import { Apartment } from '../../types';
import { CORE_ICONS } from '../../constants';
import { X, Grid, Image as ImageIcon } from 'lucide-react';

interface ApartmentHeaderProps {
  apartment: Apartment;
  onBack: () => void;
}

const ApartmentHeader: React.FC<ApartmentHeaderProps> = ({ apartment, onBack }) => {
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  if (showAllPhotos) {
    return (
      <div className="fixed inset-0 bg-black z-[200] animate-in fade-in duration-300">
        <button onClick={() => setShowAllPhotos(false)} className="absolute top-6 right-6 z-10 text-white bg-black/50 p-2 rounded-full">
          <X className="w-6 h-6" />
        </button>
        <div className="p-4 sm:p-8 pt-20 h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto columns-1 sm:columns-2 md:columns-3 gap-4">
            {apartment.photos.map((photo, idx) => (
              <img key={idx} src={photo} className="mb-4 rounded-lg w-full h-auto object-cover break-inside-avoid" alt={`View ${idx + 1}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button onClick={onBack} className="flex items-center space-x-2 text-charcoal hover:text-sky-accent transition-colors mb-8 group">
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal">Return</span>
      </button>
      
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2 tracking-tight text-charcoal">{apartment.title}</h1>
        <div className="flex items-center space-x-2 text-charcoal/80">
          <div className="text-sky-accent">{CORE_ICONS.Location("w-5 h-5")}</div>
          <span className="text-base font-medium tracking-wide">{apartment.city}</span>
        </div>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 gap-2 h-[30rem] sm:h-[40rem] rounded-2xl overflow-hidden">
        <div className="sm:row-span-2 h-full w-full">
            <img src={apartment.photos[0]} alt={apartment.title} className="w-full h-full object-cover" />
        </div>
        {apartment.photos[1] && (
            <div className="hidden sm:block h-full w-full">
                <img src={apartment.photos[1]} alt={apartment.title} className="w-full h-full object-cover" />
            </div>
        )}
        {apartment.photos[2] && (
            <div className="hidden sm:block h-full w-full">
                <img src={apartment.photos[2]} alt={apartment.title} className="w-full h-full object-cover" />
            </div>
        )}
        <button 
            onClick={() => setShowAllPhotos(true)} 
            className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-charcoal font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 border border-stone-200 shadow-md hover:bg-white transition-all">
            <Grid className="w-4 h-4" />
            Show all photos
        </button>
      </div>
    </>
  );
};

export default ApartmentHeader;
