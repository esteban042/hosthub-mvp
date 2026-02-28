import React from 'react';
import { Host } from '../../types.ts';

interface CheckInInfoProps {
  host: Host;
}

const CheckInInfo: React.FC<CheckInInfoProps> = ({ host }) => {
  // A helper to render a section if the data exists
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
      <h3 className="text-xl font-bold mb-4 text-charcoal">More about this Place</h3>
      <div className="space-y-2">

        {renderSection('Cancellation Policy', host.conditions)}

      </div>
    </div>
  );
};

export default CheckInInfo;
