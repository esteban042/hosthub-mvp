import React, { useState } from 'react';
import { ALL_AMENITIES } from '../../utils/amenities.js';

interface AmenitySelectorProps {
  selectedAmenities: string[];
  onChange: (selected: string[]) => void;
}

const AmenitySelector: React.FC<AmenitySelectorProps> = ({ selectedAmenities, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      onChange(selectedAmenities.filter(a => a !== amenity));
    } else {
      onChange([...selectedAmenities, amenity]);
    }
  };

  const filteredAmenities = ALL_AMENITIES.filter(amenity =>
    amenity.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search amenities..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border rounded-md mb-4"
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-64 overflow-y-auto">
        {filteredAmenities.map(amenity => (
          <div
            key={amenity.label}
            onClick={() => handleToggleAmenity(amenity.label)}
            className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer ${
              selectedAmenities.includes(amenity.label) ? 'bg-sky-100 border border-gray-500' : 'bg-gray-100'
            }`}>
            {React.cloneElement(amenity.icon, { className: "w-5 h-5 text-sky-accent" })}
            <span>{amenity.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmenitySelector;
