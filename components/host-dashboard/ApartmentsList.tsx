import React from 'react';
import { Apartment } from '../../types';
import { CARD_BORDER, UNIT_TITLE_STYLE } from '../../constants';

interface ApartmentsListProps {
  apartments: Apartment[];
  onConfigure: (apartment: Apartment) => void;
}

const ApartmentsList: React.FC<ApartmentsListProps> = ({ apartments, onConfigure }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {apartments.map(apt => (
        <div key={apt.id} className="bg-[#1c1a19] rounded-2xl overflow-hidden shadow-xl border flex flex-col hover:border-emerald-500/30 transition-all" style={{ borderColor: CARD_BORDER }}>
          {apt.photos && apt.photos.length > 0 && <img src={apt.photos[0]} className="aspect-video w-full object-cover" alt={apt.title} />}
          <div className="p-8 text-left">
            <h4 className="text-xl font-bold text-white mb-2 leading-tight" style={UNIT_TITLE_STYLE}>{apt.title}</h4>
            <p className="text-[10px] font-bold tracking-widest mb-10 text-stone-600 uppercase">{apt.city}</p>
            <div className="flex justify-between items-center pt-6 border-t border-stone-800/60">
              <p className="text-xl font-bold text-coral-500">${apt.pricePerNight}<span className="text-[10px] text-stone-700 ml-2 font-bold">Base</span></p>
              <button onClick={() => onConfigure(apt)} className="px-6 py-2 rounded-xl bg-transparent border border-stone-100 text-stone-100 text-[10px] font-bold uppercase tracking-widest transition-all">Configure</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApartmentsList;
