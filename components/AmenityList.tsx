import React from 'react';
import { ALL_AMENITIES } from '../utils/amenities.tsx';
import { CircleHelp } from 'lucide-react';

interface AmenityListProps {
  amenities: { name: string; description?: string }[];
  showDescriptions?: boolean;
}

const AmenityList: React.FC<AmenityListProps> = ({ amenities, showDescriptions = true }) => {
  const amenityIconMap = new Map(ALL_AMENITIES.map(a => [a.label, a.icon]));

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
      {amenities.map(({ name, description }) => {
        const iconElement = amenityIconMap.get(name);
        const Icon = iconElement 
          ? React.cloneElement(iconElement, { className: "w-6 h-6 text-sky-accent" }) 
          : <CircleHelp className="w-6 h-6 text-sky-accent" />;

        return (
          <li key={name} className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                {Icon}
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
