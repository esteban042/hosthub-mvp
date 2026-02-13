
import React from 'react';
import { Host } from '../types';

interface GenericLandingPageProps {
  hosts: Host[];
  onHostChange: (host: Host) => void;
}

const GenericLandingPage: React.FC<GenericLandingPageProps> = ({ hosts, onHostChange }) => {
  const handleHostSelection = (slug: string) => {
    if (slug) {
      window.location.href = `/?host=${slug}`;
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center text-white"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
    >
      <div className="bg-black bg-opacity-50 p-10 rounded-lg text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to Sanctum</h1>
        <p className="text-lg mb-8">Your one-stop solution for managing your properties.</p>
        <div className="mb-8">
          <select
            defaultValue=""
            onChange={(e) => handleHostSelection(e.target.value)}
            className="bg-gray-800 text-white p-3 rounded-md w-full max-w-xs text-center appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
            style={{ 
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.5em 1.5em',
            }}
          >
            <option value="" disabled>Select a Business</option>
            {hosts.map(host => (
              <option key={host.id} value={host.slug}>{host.slug}</option>
            ))}
          </select>
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-4">About Sanctum</h2>
          <p className="max-w-md">
            Sanctum is a comprehensive platform designed to streamline property management for hosts. 
            From booking and availability tracking to guest communication, we provide the tools you need to succeed.
          </p>
        </div>
        <div className="mt-8">
            <button 
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-full font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-emerald-500/20"
                onClick={() => window.location.href = 'mailto:info@sanctum.com'}
            >
                Contact Us
            </button>
        </div>
      </div>
    </div>
  );
};

export default GenericLandingPage;
