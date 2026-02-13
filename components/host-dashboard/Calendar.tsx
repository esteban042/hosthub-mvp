
import React from 'react';
import { useAppData } from '../../services/useAppData';
import TimelineCalendar from './TimelineCalendar';

const Calendar: React.FC = () => {
  const { apartments, bookings, blockedDates, onToggleBlock, loading, error } = useAppData();

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-4">Booking Calendar</h1>
      <TimelineCalendar 
        apartments={apartments} 
        bookings={bookings} 
        blockedDates={blockedDates}
        onToggleBlock={onToggleBlock}
      />
    </div>
  );
};

export default Calendar;
