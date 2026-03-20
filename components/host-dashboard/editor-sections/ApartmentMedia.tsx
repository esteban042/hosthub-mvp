import React from 'react';
import { useTranslation } from 'react-i18next';
import { Apartment } from '../../../types';
import { Trash2, Info } from 'lucide-react';
import ImageUpload from '../ImageUpload';

interface ApartmentMediaProps {
  apt: Partial<Apartment>;
  onAptChange: (field: keyof Apartment, value: any) => void;
  onAddPhoto: (url: string) => void;
  onRemovePhoto: (index: number) => void;
}

const ApartmentMedia: React.FC<ApartmentMediaProps> = ({ apt, onAptChange, onAddPhoto, onRemovePhoto }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-10">
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">{t('host_dashboard.apartment_editor.apartment_media.map_embed_url')}</label>
        <input type="text" value={apt.mapEmbedUrl || ''} onChange={e => onAptChange('mapEmbedUrl', e.target.value)} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
      </div>

      <div className="pt-8 border-t border-stone-200">
        <h4 className="text-lg sm:text-xl font-bold text-charcoal tracking-tight mb-8">{t('host_dashboard.apartment_editor.apartment_media.unit_photos')}</h4>
        <ImageUpload onUploadComplete={onAddPhoto} />
        <div className="space-y-4 mt-4">
          {apt.photos?.map((photo, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 bg-white/50 p-4 rounded-2xl border border-stone-300 animate-in slide-in-from-bottom-2">
              <img src={photo} alt={t('host_dashboard.apartment_editor.apartment_media.apartment_alt')} className="w-20 h-20 sm:w-16 sm:h-16 rounded-lg object-cover" />
              <input
                type="text"
                readOnly
                value={photo}
                className="w-full flex-grow bg-white border-stone-300 rounded-xl p-3 text-xs text-charcoal outline-none"
              />
              <button
                type="button"
                onClick={() => onRemovePhoto(index)}
                className="p-3 w-full sm:w-auto bg-white border border-stone-300 rounded-xl text-stone-400 hover:text-rose-500 transition-all"
              >
                <Trash2 className="w-5 h-5 mx-auto" />
              </button>
            </div>
          ))}
          {(!apt.photos || apt.photos.length === 0) && (
            <div className="py-12 border border-dashed border-stone-300 rounded-[2rem] flex flex-col items-center justify-center text-stone-400 italic text-sm text-center">
              <Info className="w-6 h-6 mb-2 opacity-20" />
              <span>{t('host_dashboard.apartment_editor.apartment_media.no_photos_added')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApartmentMedia;
