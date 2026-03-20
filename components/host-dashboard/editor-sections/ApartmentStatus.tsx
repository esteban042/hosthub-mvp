import React from 'react';
import { useTranslation } from 'react-i18next';
import { Apartment } from '../../../types';

interface ApartmentStatusProps {
  apt: Partial<Apartment>;
  onAptChange: (field: keyof Apartment, value: any) => void;
}

const ApartmentStatus: React.FC<ApartmentStatusProps> = ({ apt, onAptChange }) => {
  const { t } = useTranslation();
  const currentStatus = apt.isActive === undefined ? true : apt.isActive;

  return (
    <div className="pt-8 border-t border-stone-200">
        <div className="flex items-center justify-between">
            <div>
                <h4 className="text-lg sm:text-xl font-bold text-charcoal tracking-tight">{t('host_dashboard.apartment_editor.apartment_status.unit_status')}</h4>
                <p className="text-sm text-stone-500">{t('host_dashboard.apartment_editor.apartment_status.status_description')}</p>
            </div>
            <button
                type="button"
                onClick={() => onAptChange('isActive', !currentStatus)}
                className={`relative inline-flex flex-shrink-0 h-7 w-14 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${currentStatus ? 'bg-green-500' : 'bg-stone-300'}`}
                role="switch"
                aria-checked={currentStatus}
            >
                <span className="sr-only">{t('host_dashboard.apartment_editor.apartment_status.use_setting')}</span>
                <span
                    aria-hidden="true"
                    className={`inline-block h-6 w-6 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${currentStatus ? 'translate-x-6' : 'translate-x-0'}`}
                />
            </button>
        </div>
    </div>
  );
};

export default ApartmentStatus;
