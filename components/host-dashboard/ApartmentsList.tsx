import React from 'react';
import { Apartment } from '../../types';
import { CARD_BORDER } from '../../constants';
import { Eye } from 'lucide-react';
import AirbnbImporter from './Importer'; // Import the new component

interface ApartmentsListProps {
  apartments: Apartment[];
  onConfigure: (apartment: Apartment) => void;
}

const ApartmentsList: React.FC<ApartmentsListProps> = ({ apartments, onConfigure }) => {
  return (
    <div>
      <AirbnbImporter /> {/* Add the importer component here */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {apartments.map(apt => (
          <div key={apt.id} className="bg-alabaster rounded-2xl overflow-hidden shadow-xl border flex flex-col transition-all" style={{ borderColor: CARD_BORDER }}>
            {apt.photos && apt.photos.length > 0 && <img src={apt.photos[0]} className="aspect-video w-full object-cover" alt={apt.title} />}
            <div className="p-8 text-left flex flex-col flex-grow">
              <h4 className="text-xl font-bold text-charcoal mb-2 leading-tight">{apt.title}</h4>
              <div className="flex justify-between items-center mb-10">
                <p className="text-[10px] font-bold tracking-widest text-charcoal/60 uppercase">{apt.city}</p>
                <div className="flex items-center space-x-1.5">
                  <Eye className="w-4 h-4 text-charcoal/60" />
                  <span className="text-[10px] font-bold tracking-widest text-charcoal/60">{apt.pageViews || 0}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-charcoal/10 mt-auto">
                <p className="text-xl font-bold text-coral-500">${apt.pricePerNight}<span className="text-[10px] text-charcoal/60 ml-2 font-bold">Base</span></p>
                <button onClick={() => onConfigure(apt)} className="px-6 py-2 rounded-xl bg-transparent border border-gray-600 text-charcoal-darker hover:text-white hover:bg-gray-600 text-[10px] font-bold uppercase tracking-widest transition-all">Configure</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApartmentsList;
