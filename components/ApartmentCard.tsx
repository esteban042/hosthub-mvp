import React from 'react';
import { Apartment } from '../types';
import { CORE_ICONS } from '../constants';

interface ApartmentCardProps {
  apartment: Apartment;
  onSelectApartment: (id: string) => void;
  idx: number;
}

const ApartmentCard: React.FC<ApartmentCardProps> = ({ apartment, onSelectApartment, idx }) => {
  return (
    <div 
      key={apartment.id} 
      onClick={() => onSelectApartment(apartment.id)}
      className="group cursor-pointer animate-in fade-in duration-700"
      style={{ animationDelay: `${idx * 150}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-6 border border-stone-800 shadow-xl">
        <img src={apartment.photos[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms]" alt={apartment.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="absolute bottom-4 left-4 bg-stone-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-lg">
          <span className="text-white font-black text-xl">${apartment.pricePerNight || 0}</span>
          <span className="text-[10px] font-bold text-stone-400 ml-1 uppercase">/ night</span>
        </div>
      </div>

      <div className="px-1">
        <h3 className="text-2xl font-serif font-bold text-white tracking-tight mb-1 leading-none">{apartment.title}</h3>
        
        <div className="flex items-center space-x-2 text-[12px] font-bold uppercase tracking-[0.15em] text-stone-500 mb-6 mt-2">
          <div className="text-stone-500">{CORE_ICONS.Location("w-3.5 h-3.5")}</div>
          <span>{apartment.city}</span>
        </div>

        <div className="flex items-center space-x-10">
           <div className="flex items-center space-x-2">
             <div className="text-stone-500">{CORE_ICONS.Bed("w-4 h-4")}</div>
             <span className="text-stone-400 font-medium text-sm">{apartment.bedrooms}</span>
           </div>
           <div className="flex items-center space-x-2">
             <div className="text-stone-500">{CORE_ICONS.Bath("w-4 h-4")}</div>
             <span className="text-stone-400 font-medium text-sm">{apartment.bathrooms}</span>
           </div>
           <div className="flex items-center space-x-2">
             <div className="text-stone-500">{CORE_ICONS.Guests("w-4 h-4")}</div>
             <span className="text-stone-400 font-medium text-sm">{apartment.capacity}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentCard;
