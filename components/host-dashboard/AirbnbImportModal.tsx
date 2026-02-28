import React, { useState } from 'react';
import { X, Download, Loader } from 'lucide-react';

interface AirbnbImportModalProps {
  onClose: () => void;
  onImport: (listingUrl: string) => void;
  loading: boolean;
}

const AirbnbImportModal: React.FC<AirbnbImportModalProps> = ({ onClose, onImport, loading }) => {
  const [listingUrl, setListingUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (listingUrl) {
      onImport(listingUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-auto relative animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600">
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-3 rounded-full bg-sky-100 mb-4">
              <Download className="w-8 h-8 text-sky-700" />
            </div>
            <h2 className="text-2xl font-bold font-serif tracking-tight text-charcoal">Import from Airbnb</h2>
            <p className="text-sm text-charcoal/70 mt-2">Paste your Airbnb listing URL below to create a new unit.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <label htmlFor="listing-url" className="text-xs font-bold uppercase tracking-widest text-charcoal/60">Listing URL</label>
              <input
                id="listing-url"
                type="url"
                value={listingUrl}
                onChange={(e) => setListingUrl(e.target.value)}
                placeholder="https://www.airbnb.com/rooms/..."
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                required
              />
            </div>

            <div className="mt-8">
              <button 
                type="submit"
                className="w-full bg-sky-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-800 transition-all flex items-center justify-center disabled:bg-sky-300"
                disabled={loading || !listingUrl}
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Import Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AirbnbImportModal;
