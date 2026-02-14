import React from 'react';
import { AMENITY_ICONS } from '../constants';

interface AmenityListProps {
  amenities: { name: string; description?: string }[];
  showDescriptions?: boolean;
}

const AmenityList: React.FC<AmenityListProps> = ({ amenities, showDescriptions = true }) => {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
      {amenities.map(({ name, description }) => {
        const Icon = AMENITY_ICONS[name] || AMENITY_ICONS['Default'];
        return (
          <li key={name} className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                {Icon("w-6 h-6")}
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-charcoal">{name}</h4>
              {showDescriptions && description && <p className="text-charcoal/70 mt-1">{description}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default AmenityList;
