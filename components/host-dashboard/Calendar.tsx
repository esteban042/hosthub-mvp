import React from 'react';
import { Apartment, Booking, BlockedDate } from '../../types';
import AvailabilityCalendar from '../AvailabilityCalendar';

interface CalendarProps {
  apartments: Apartment[];
  bookings: Booking[];
  blockedDates: BlockedDate[];
  airbnbCalendarDates: string[];
  loadingIcal: boolean;
  onToggleBlock: (aptId: string, date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ 
  apartments, 
  bookings, 
  blockedDates, 
  airbnbCalendarDates, 
  loadingIcal, 
  onToggleBlock 
}) => {
  return (
    <div className="space-y-20">
      {apartments.map(apt => (
        <div key={apt.id}>
          <div className="lg:col-span-2 space-y-8 text-left">
            <h3 className="text-3xl font-serif font-bold text-white tracking-tight">{apt.title}</h3>
            <p className="text-sm text-stone-500">Manage manual overrides and view occupancy for this unit.</p>
          </div>
          <div className="lg:col-span-3 text-white ">
            <AvailabilityCalendar 
              aptId={apt.id} 
              bookings={bookings} 
              blockedDates={blockedDates} 
              airbnbCalendarDates={airbnbCalendarDates}
              loadingIcal={loadingIcal}
              onToggle={(d) => onToggleBlock(apt.id, d)} 
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Calendar;
