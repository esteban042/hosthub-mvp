
import React from 'react';
import { Host, Apartment, Booking } from '../../types';
import HostCard from './HostCard';

interface HostsGridProps {
  hosts: Host[];
  apartments: Apartment[];
  bookings: Booking[];
  onConfigureHost: (host: Host) => void;
}

const HostsGrid: React.FC<HostsGridProps> = ({ hosts, apartments, bookings, onConfigureHost }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {hosts.map(host => (
        <HostCard 
          key={host.id} 
          host={host} 
          apartments={apartments} 
          bookings={bookings} 
          onConfigure={onConfigureHost} 
        />
      ))}
    </div>
  );
};

export default HostsGrid;
