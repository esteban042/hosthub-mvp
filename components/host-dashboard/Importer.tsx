import React, { useState } from 'react';
import { fetchApi } from '../../services/api';

const AirbnbImporter: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleImport = async () => {
    if (!url) {
      setError('Please provide an Airbnb URL.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetchApi('/api/v1/import/airbnb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        setSuccess('Successfully imported apartment! You can now edit it in your dashboard.');
        setUrl('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'An unexpected error occurred.');
      }
    } catch (err: any) {
      setError('An error occurred during the import.');
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 my-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Import from Airbnb</h3>
      <p className="text-gray-500 text-sm mb-4">Paste the URL of an Airbnb listing to automatically import its details.</p>
      <div className="flex space-x-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.airbnb.com/rooms/12345"
          className="flex-grow bg-gray-100 border border-gray-300 rounded-lg px-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <button
          onClick={handleImport}
          disabled={isLoading}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Importing...' : 'Import'}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
    </div>
  );
};

export default AirbnbImporter;
