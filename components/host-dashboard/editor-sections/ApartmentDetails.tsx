
import React from 'react';
import { Apartment } from '../../../types';
import AmenitySelector from '../AmenitySelector';

interface ApartmentDetailsProps {
  apt: Partial<Apartment>;
  onAptChange: (field: keyof Apartment, value: any) => void;
  onAmenitiesChange: (amenities: string[]) => void;
}

const ApartmentDetails: React.FC<ApartmentDetailsProps> = ({ apt, onAptChange, onAmenitiesChange }) => {
  return (
    <div className="space-y-10">
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">Description</label>
            <textarea value={apt.description || ''} onChange={e => onAptChange('description', e.target.value)} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal h-40 sm:h-60 resize-y focus:ring-1 focus:ring-sky-accent outline-none" />
        </div>

        <div className="pt-8 border-t border-stone-200">
            <h4 className="text-lg sm:text-xl font-bold text-charcoal tracking-tight mb-8">Amenities</h4>
            <AmenitySelector
                selectedAmenities={apt.amenities || []}
                onChange={onAmenitiesChange}
            />
        </div>
    </div>
  );
};

export default ApartmentDetails;
