import React from 'react';
import { useTranslation } from 'react-i18next';
import { Host } from '../../types.ts';

interface CheckInInfoProps {
  host: Host;
}

const CheckInInfo: React.FC<CheckInInfoProps> = ({ host }) => {
  const { t } = useTranslation();

  const renderSection = (title: string, data: string | null | undefined) => {
    if (!data) return null;
    return (
      <div>
        <h4 className="font-semibold mt-3 text-lg">{title}</h4>
        <p className="whitespace-pre-wrap text-gray-300">{data}</p>
      </div>
    );
  };

  return (
    <div className="p-6 rounded-lg shadow-inner">
      <h3 className="text-xl font-bold mb-4 text-charcoal">{t('apartment.check_in_info.more_about_this_place')}</h3>
      <div className="space-y-2">

        {renderSection(t('apartment.check_in_info.cancellation_policy'), host.conditions)}

      </div>
    </div>
  );
};

export default CheckInInfo;
