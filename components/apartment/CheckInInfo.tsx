import React from 'react';
import { Host } from '../../types';

interface CheckInInfoProps {
  host: Host;
}

const CheckInInfo: React.FC<CheckInInfoProps> = ({ host }) => {
  if (!host.checkInTime && !host.checkOutTime && !host.checkInInfo) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-stone-200/60">
      <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">Check-in & Check-out</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/50 border border-stone-300 rounded-2xl p-8">
        <div className="flex items-start">
          <div className="mr-4 pt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-charcoal">Check-in time</h3>
            <p className="text-charcoal/80">{host.checkInTime || 'Not specified'}</p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="mr-4 pt-1">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-charcoal">Check-out time</h3>
            <p className="text-charcoal/80">{host.checkOutTime || 'Not specified'}</p>
          </div>
        </div>
        {host.checkInInfo && (
            <div className="md:col-span-2 flex items-start mt-4">
                <div className="mr-4 pt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-charcoal">Check-in Instructions</h3>
                    <p className="text-charcoal/80 whitespace-pre-line">{host.checkInInfo}</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CheckInInfo;
