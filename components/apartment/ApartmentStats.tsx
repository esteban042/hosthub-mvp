import React from 'react';
import { Apartment } from '../../types';
import { CORE_ICONS } from '../../constants';

interface ApartmentStatsProps {
  apartment: Apartment;
}

const ApartmentStats: React.FC<ApartmentStatsProps> = ({ apartment }) => {
  const stats = [
    { icon: CORE_ICONS.Bed("w-8 h-8 text-sky-700"), label: 'Beds', value: apartment.guests },
    { icon: CORE_ICONS.Bath("w-8 h-8 text-sky-700"), label: 'Baths', value: apartment.bathrooms },
    { icon: CORE_ICONS.Guests("w-7 h-7 text-sky-700"), label: 'Guests', value: apartment.capacity },
  ];

  return (
    <div className="py-8 my-12">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 border-y border-stone-200 py-8">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`flex flex-row items-center justify-center gap-x-4
              ${index < stats.length - 1 ? 'sm:border-r sm:border-stone-200' : ''}
              ${index > 0 ? 'mt-8 sm:mt-0' : ''}
            `}>
            {stat.icon}
            <div className="flex flex-col items-start">
              <p className="text-4xl font-bold text-charcoal -mb-1">{stat.value}</p>
              <p className="text-sm font-bold uppercase tracking-widest text-charcoal/60">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApartmentStats;
