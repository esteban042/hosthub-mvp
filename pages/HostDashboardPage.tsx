import React from 'react';
import { Host, Apartment, Booking } from '../types.js';

interface HostDashboardPageProps {
  host: Host;
  apartments: Apartment[];
  bookings: Booking[];
  onLogout: () => void;
}

export const HostDashboardPage: React.FC<HostDashboardPageProps> = ({ host, onLogout }) => {
  return (
    <div className="min-h-screen bg-alabaster text-charcoal p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold font-serif">Host Dashboard</h1>
        <button 
          onClick={onLogout}
          className="bg-emerald-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Logout
        </button>
      </header>
      <div className="bg-white/50 p-8 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">Welcome, {host.name}!</h2>
        <p className="text-charcoal/60">This is your dashboard. More features to come!</p>
      </div>
    </div>
  );
};
