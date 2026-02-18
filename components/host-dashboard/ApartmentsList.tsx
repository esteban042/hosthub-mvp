import React from 'react';
import { Apartment } from '../../types';
import { CARD_BORDER } from '../../constants';

interface ApartmentsListProps {
  apartments: Apartment[];
  onConfigure: (apartment: Apartment) => void;
}

const ApartmentsList: React.FC<ApartmentsListProps> = ({ apartments, onConfigure }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {apartments.map(apt => (
        <div key={apt.id} className="bg-alabaster rounded-2xl overflow-hidden shadow-xl border flex flex-col transition-all" style={{ borderColor: CARD_BORDER }}>
          {apt.photos && apt.photos.length > 0 && <img src={apt.photos[0]} className="aspect-video w-full object-cover" alt={apt.title} />}
          <div className="p-8 text-left">
            <h4 className="text-xl font-bold text-charcoal mb-2 leading-tight">{apt.title}</h4>
            <p className="text-[10px] font-bold tracking-widest mb-10 text-charcoal/60 uppercase">{apt.city}</p>
            <div className="flex justify-between items-center pt-6 border-t border-charcoal/10">
              <p className="text-xl font-bold text-coral-500">${apt.pricePerNight}<span className="text-[10px] text-charcoal/60 ml-2 font-bold">Base</span></p>
              <button onClick={() => onConfigure(apt)} className="px-6 py-2 rounded-xl bg-transparent border border-gray-600 text-charcoal-darker hover:text-white hover:bg-charcoal-darker text-[10px] font-bold uppercase tracking-widest transition-all">Configure</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApartmentsList;
