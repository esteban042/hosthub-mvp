import React from 'react';
import { Apartment } from '../types';
import { CORE_ICONS } from '../constants';

interface ApartmentStatsProps {
  apartment: Apartment;
}

const ApartmentStats: React.FC<ApartmentStatsProps> = ({ apartment }) => {
  return (
    <div className="flex items-center space-x-12 py-8 border-y border-stone-800/40 mb-16 overflow-x-auto whitespace-nowrap scrollbar-hide">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 flex items-center justify-center text-sky-700 ">
          {CORE_ICONS.Bed("w-8 h-8")}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Beds</span>
          <span className="text-2xl font-bold text-sky-accent leading-none mt-1">{apartment.bedrooms}</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 flex items-center justify-center text-sky-700">
          {CORE_ICONS.Bath("w-8 h-8")}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Baths</span>
          <span className="text-2xl font-bold leading-none mt-1">{apartment.bathrooms}</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 flex items-center justify-center text-sky-700 ">
          {CORE_ICONS.Guests("w-7 h-7")}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Guests</span>
          <span className="text-2xl font-bold leading-none mt-1">{apartment.capacity}</span>
        </div>
      </div>
    </div>
  );
};

export default ApartmentStats;
