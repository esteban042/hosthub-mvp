import React from 'react';
import { Apartment } from '../../types';
import { AMENITY_ICONS } from '../../constants';

interface ApartmentInfoProps {
  apartment: Apartment;
}

const ApartmentInfo: React.FC<ApartmentInfoProps> = ({ apartment }) => {

  const toSentenceCase = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <h3 className="text-2xl font-serif font-bold text-charcoal tracking-tight">About this place</h3>
        <p className="text-lg leading-relaxed text-charcoal/80 whitespace-pre-line">
          {apartment.description}
        </p>
      </div>

      <div className="space-y-8 pt-8 border-t border-stone-200">
        <h3 className="text-2xl font-serif font-bold text-charcoal tracking-tight">What this place offers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {apartment.amenities.map(amenity => (
            <div key={amenity} className="flex items-center space-x-4">
              <div className="text-sky-700 w-6 h-6 flex-shrink-0">
                {AMENITY_ICONS[amenity] ? AMENITY_ICONS[amenity]("w-full h-full") : AMENITY_ICONS['Default']!("w-full h-full")}
              </div>
              <span className="text-lg text-charcoal/80">{toSentenceCase(amenity)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApartmentInfo;
