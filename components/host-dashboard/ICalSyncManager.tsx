import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ICalUrl, ICalSource, Apartment } from '../../types';
import { Trash2, PlusCircle } from 'lucide-react';

interface ICalSyncManagerProps {
  apartment: Partial<Apartment>;
  onIcalUrlsChange: (newIcalUrls: ICalUrl[]) => void;
}

const ICalSyncManager: React.FC<ICalSyncManagerProps> = ({ apartment, onIcalUrlsChange }) => {
  const { t } = useTranslation();
  const [newUrl, setNewUrl] = useState('');
  const [newSource, setNewSource] = useState<ICalSource>(ICalSource.AIRBNB);

  const handleAddIcalUrl = () => {
    if (newUrl.trim() !== '') {
      const newIcalUrl: ICalUrl = { url: newUrl.trim(), source: newSource };
      const updatedIcalUrls = [...(apartment.icalUrls || []), newIcalUrl];
      onIcalUrlsChange(updatedIcalUrls);
      setNewUrl('');
      setNewSource(ICalSource.AIRBNB);
    }
  };

  const handleRemoveIcalUrl = (urlToRemove: string) => {
    const updatedIcalUrls = (apartment.icalUrls || []).filter(ical => ical.url !== urlToRemove);
    onIcalUrlsChange(updatedIcalUrls);
  };

  return (
    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('host_dashboard.apartment_editor.ical_sync.title')}</h3>
      <p className="text-sm text-gray-600 mb-6">
        {t('host_dashboard.apartment_editor.ical_sync.description')}
      </p>

      <div className="space-y-4 mb-6">
        {(apartment.icalUrls || []).map((ical, index) => (
          <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm flex-wrap">
            <div className="flex items-center mb-2 sm:mb-0">
              <span className={`px-2.5 py-1 text-xs font-semibold text-white rounded-full ${ical.source === ICalSource.AIRBNB ? 'bg-red-500' : 'bg-blue-500'}`}>
                {ical.source}
              </span>
              <span className="ml-4 text-sm text-gray-700 truncate break-all">{ical.url}</span>
            </div>
            <button type="button" onClick={() => handleRemoveIcalUrl(ical.url)} className="text-gray-400 hover:text-red-500 transition-colors ml-auto">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:space-x-3 space-y-3 sm:space-y-0">
        <input
          type="text"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder={t('host_dashboard.apartment_editor.ical_sync.paste_ical_url')}
          className="w-full sm:flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 transition-shadow"
        />
        <select
          value={newSource}
          onChange={(e) => setNewSource(e.target.value as ICalSource)}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 transition-shadow bg-white"
        >
          {Object.values(ICalSource).map(source => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
        <button type="button" onClick={handleAddIcalUrl} className="w-full sm:w-auto px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors flex items-center justify-center space-x-2">
          <PlusCircle size={18} />
          <span>{t('host_dashboard.apartment_editor.ical_sync.add')}</span>
        </button>
      </div>
    </div>
  );
};

export default ICalSyncManager;
