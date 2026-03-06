import React, { useState } from 'react';
import { ICalUrl, ICalSource, Apartment } from '../../types';
import { Trash2, PlusCircle } from 'lucide-react';

interface ICalSyncManagerProps {
  apartment: Partial<Apartment>; // Changed to Partial<Apartment> to match ApartmentEditor
  onIcalUrlsChange: (newIcalUrls: ICalUrl[]) => void;
}

const ICalSyncManager: React.FC<ICalSyncManagerProps> = ({ apartment, onIcalUrlsChange }) => {
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
    <div className="bg-gray-50 p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">iCal Sync</h3>
      <p className="text-sm text-gray-600 mb-6">
        Keep your availability up-to-date by syncing your calendars from other platforms like Airbnb, Booking.com, etc.
      </p>

      <div className="space-y-4 mb-6">
        {(apartment.icalUrls || []).map((ical, index) => (
          <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm">
            <div className="flex items-center">
              <span className={`px-2.5 py-1 text-xs font-semibold text-white rounded-full ${ical.source === ICalSource.AIRBNB ? 'bg-red-500' : 'bg-blue-500'}`}>
                {ical.source}
              </span>
              <span className="ml-4 text-sm text-gray-700 truncate">{ical.url}</span>
            </div>
            <button type="button" onClick={() => handleRemoveIcalUrl(ical.url)} className="text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="text"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="Paste iCal URL here..."
          className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 transition-shadow"
        />
        <select
          value={newSource}
          onChange={(e) => setNewSource(e.target.value as ICalSource)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 transition-shadow bg-white"
        >
          {Object.values(ICalSource).map(source => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
        <button type="button" onClick={handleAddIcalUrl} className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors flex items-center space-x-2">
          <PlusCircle size={18} />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
};

export default ICalSyncManager;
