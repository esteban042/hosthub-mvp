import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sanctumApi } from '../../../services/api';
import { Apartment } from '../../../types';

interface ApartmentImportProps {
  onImport: (data: Partial<Apartment>) => void;
}

const ApartmentImport: React.FC<ApartmentImportProps> = ({ onImport }) => {
  const { t } = useTranslation();
  const [airbnbUrl, setAirbnbUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleAirbnbImport = async () => {
    if (!airbnbUrl) {
      setImportError(t('host_dashboard.apartment_editor.apartment_import.enter_airbnb_url_error'));
      return;
    }
    setIsImporting(true);
    setImportError(null);
    try {
      const response = await sanctumApi.post('/api/misc/scrape-airbnb', { url: airbnbUrl });
      const { title, description, amenities, photos, price } = response;
      onImport({
        title,
        description,
        amenities,
        photos,
        pricePerNight: price,
      });
    } catch (error: any) {
      setImportError(error.message || t('host_dashboard.apartment_editor.apartment_import.import_error'));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">{t('host_dashboard.apartment_editor.apartment_import.import_from_airbnb')}</label>
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder={t('host_dashboard.apartment_editor.apartment_import.paste_airbnb_url')} 
          value={airbnbUrl} 
          onChange={e => setAirbnbUrl(e.target.value)} 
          className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal focus:ring-1 focus:ring-sky-accent transition-all outline-none" 
        />
        <button 
          type="button" 
          onClick={handleAirbnbImport} 
          disabled={isImporting} 
          className="bg-cyan-600/10 text-cyan-700 border border-cyan-700/40 px-6 py-2 rounded-xl hover:bg-emerald-500/20 transition-all flex items-center justify-center space-x-2"
        >
          {isImporting ? t('host_dashboard.apartment_editor.apartment_import.importing') : t('host_dashboard.apartment_editor.apartment_import.import')}
        </button>
      </div>
      {importError && <p className="text-sm text-red-500">{importError}</p>}
    </div>
  );
};

export default ApartmentImport;
