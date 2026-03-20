import React from 'react';
import { useTranslation } from 'react-i18next';
import { Apartment } from '../types.js';
import ApartmentCard from './apartment/ApartmentCard.js';

interface FeaturedStaysProps {
  apartments: Apartment[];
  onSelectApartment: (id: string) => void;
}

const FeaturedStays: React.FC<FeaturedStaysProps> = ({ apartments, onSelectApartment }) => {
  const { t } = useTranslation();

  return (
    <section className="max-w-7xl mx-auto px-6 py-32">
      <div className="mb-16">
        <h2 className="text-5xl font-serif font-bold mb-2 tracking-tight">{t('featured_stays.available_units')}</h2>
        <p className="text-stone-500 text-lg font-medium">{t('featured_stays.properties_available', { count: apartments.length })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
        {apartments.map((apt, idx) => (
          <ApartmentCard 
            key={apt.id} 
            apartment={apt} 
            onSelectApartment={onSelectApartment} 
            idx={idx} 
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedStays;
