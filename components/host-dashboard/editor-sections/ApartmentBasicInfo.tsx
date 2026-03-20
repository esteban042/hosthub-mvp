import React from 'react';
import { useTranslation } from 'react-i18next';
import { Apartment } from '../../../types';

interface ApartmentBasicInfoProps {
  apt: Partial<Apartment>;
  onAptChange: (field: keyof Apartment, value: any) => void;
}

const ApartmentBasicInfo: React.FC<ApartmentBasicInfoProps> = ({ apt, onAptChange }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">{t('host_dashboard.apartment_editor.apartment_basic_info.unit_title')}</label>
                <input type="text" required value={apt.title || ''} onChange={e => onAptChange('title', e.target.value)} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
            </div>
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">{t('host_dashboard.apartment_editor.apartment_basic_info.city')}</label>
                <input type="text" required value={apt.city || ''} onChange={e => onAptChange('city', e.target.value)} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal outline-none" />
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">{t('host_dashboard.apartment_editor.apartment_basic_info.beds')}</label>
                <input type="number" value={apt.beds || 1} onChange={e => onAptChange('beds', parseInt(e.target.value))} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal outline-none" />
            </div>
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">{t('host_dashboard.apartment_editor.apartment_basic_info.bathrooms')}</label>
                <input type="number" value={apt.bathrooms || 1} onChange={e => onAptChange('bathrooms', parseInt(e.target.value))} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal outline-none" />
            </div>
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">{t('host_dashboard.apartment_editor.apartment_basic_info.guests')}</label>
                <input type="number" value={apt.capacity || 1} onChange={e => onAptChange('capacity', parseInt(e.target.value))} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal outline-none" />
            </div>
        </div>
    </div>
  );
};

export default ApartmentBasicInfo;
