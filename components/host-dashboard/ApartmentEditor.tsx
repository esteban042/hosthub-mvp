import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Apartment, PriceRule, Host, ICalUrl } from '../../types';
import { X } from 'lucide-react';
import ApartmentImport from './editor-sections/ApartmentImport';
import ApartmentBasicInfo from './editor-sections/ApartmentBasicInfo';
import ApartmentPricing from './editor-sections/ApartmentPricing';
import ApartmentMedia from './editor-sections/ApartmentMedia';
import ApartmentDetails from './editor-sections/ApartmentDetails';
import ApartmentStatus from './editor-sections/ApartmentStatus';
import ICalSyncManager from './ICalSyncManager';

interface ApartmentEditorProps {
  editingApt: Partial<Apartment> | null;
  host: Host | null;
  onSave: (apartment: Partial<Apartment>) => void;
  onClose: () => void;
  onIcalUrlsChange: (apartmentId: string, icalUrls: ICalUrl[]) => Promise<void>;
}

const ApartmentEditor: React.FC<ApartmentEditorProps> = ({ editingApt, host, onSave, onClose, onIcalUrlsChange }) => {
  const { t } = useTranslation();
  const [apt, setApt] = useState<Partial<Apartment> | null>(editingApt);

  if (!apt) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(apt);
  };

  const handleAptChange = (field: keyof Apartment, value: any) => {
    setApt(prev => (prev ? { ...prev, [field]: value } : null));
  };

  const handleImport = (data: Partial<Apartment>) => {
    setApt(prev => (prev ? { ...prev, ...data } : null));
  };

  const addPriceRule = () => {
    setApt(prevApt => {
      if (!prevApt) return null;
      const current = prevApt.priceOverrides || [];
      return {
        ...prevApt,
        priceOverrides: [...current, { id: `pr-${Date.now()}`, startDate: '', endDate: '', price: prevApt.pricePerNight || 0, label: '' }]
      };
    });
  };

  const updatePriceRule = (id: string, updates: Partial<PriceRule>) => {
    setApt(prevApt => {
        if (!prevApt) return null;
        const current = prevApt.priceOverrides || [];
        return {
            ...prevApt,
            priceOverrides: current.map(r => r.id === id ? { ...r, ...updates } : r)
        };
    });
  };

  const removePriceRule = (id: string) => {
    setApt(prevApt => {
        if (!prevApt) return null;
        const current = prevApt.priceOverrides || [];
        return { ...prevApt, priceOverrides: current.filter(rule => rule.id !== id) };
    });
  };

  const addPhoto = (url: string) => {
    setApt(prevApt => {
        if (!prevApt) return null;
        const currentPhotos = prevApt.photos || [];
        return { ...prevApt, photos: [...currentPhotos, url] };
    });
  };

  const removePhoto = (index: number) => {
    setApt(prevApt => {
        if (!prevApt) return null;
        const currentPhotos = prevApt.photos || [];
        return { ...prevApt, photos: currentPhotos.filter((_, i) => i !== index) };
    });
  };

  const handleAmenitiesChange = (newAmenities: string[]) => {
    setApt(prev => (prev ? { ...prev, amenities: newAmenities } : null));
  };

  const handleIcalUrlsChange = (newIcalUrls: ICalUrl[]) => {
    if (apt?.id) {
        onIcalUrlsChange(apt.id, newIcalUrls);
    }
    setApt(prev => (prev ? { ...prev, icalUrls: newIcalUrls } : null));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-stone-900/50 backdrop-blur-lg flex items-start justify-center p-4 sm:p-6 animate-in fade-in duration-300 overflow-y-auto">
       <div className="bg-[#F7F5F0] border border-stone-200 w-full max-w-4xl rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl space-y-10 my-8 sm:my-12 relative text-left font-dm">
          <button onClick={onClose} className="absolute top-6 right-6 sm:top-10 sm:right-10 text-stone-400 hover:text-charcoal transition-colors"><X className="w-7 h-7 sm:w-8 sm:h-8" /></button>
          <h3 className="text-2xl sm:text-3xl font-bold text-charcoal leading-none tracking-tight">{t('host_dashboard.apartment_editor.unit_configuration')}</h3>

          <ApartmentImport onImport={handleImport} />

          <form onSubmit={handleSave} className="space-y-10">
            <ApartmentBasicInfo apt={apt} onAptChange={handleAptChange} />
            <ApartmentPricing 
                apt={apt} 
                host={host} 
                onAptChange={handleAptChange} 
                onAddPriceRule={addPriceRule}
                onUpdatePriceRule={updatePriceRule}
                onRemovePriceRule={removePriceRule}
            />
            <ApartmentMedia 
                apt={apt} 
                onAptChange={handleAptChange} 
                onAddPhoto={addPhoto}
                onRemovePhoto={removePhoto}
            />
            <ApartmentDetails 
                apt={apt} 
                onAptChange={handleAptChange} 
                onAmenitiesChange={handleAmenitiesChange}
            />
             <ICalSyncManager
                apartment={apt}
                onIcalUrlsChange={handleIcalUrlsChange} />
            <ApartmentStatus apt={apt} onAptChange={handleAptChange} />

             <div className="flex flex-col sm:flex-row-reverse gap-3 pt-6 border-t border-stone-200">
                <button type="submit" className="w-full sm:w-auto bg-sky-700 text-white font-bold py-4 px-8 rounded-full transition-all text-[10px] uppercase tracking-widest hover:bg-sky-800 active:scale-95">{t('host_dashboard.apartment_editor.save_unit')}</button>
                <button type="button" onClick={onClose} className="w-full sm:w-auto font-bold py-4 px-8 rounded-full border border-stone-300 text-charcoal/70 hover:bg-stone-100 transition-all text-[10px] uppercase tracking-widest">{t('host_dashboard.apartment_editor.discard')}</button>
             </div>
          </form>
       </div>
    </div>
  );
};

export default ApartmentEditor;
