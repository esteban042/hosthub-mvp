import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Booking, BlockedDate, BookingStatus } from '../types';
import { CARD_BORDER } from '../constants.tsx';

const AvailabilityCalendar: React.FC<{ 
  aptId: string, 
  bookings: Booking[], 
  blockedDates: BlockedDate[], 
  airbnbCalendarDates: string[], 
  loadingIcal: boolean, 
  onToggle: (date: string) => void 
}> = ({ aptId, bookings, blockedDates, airbnbCalendarDates, loadingIcal, onToggle }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const startOffset = (date: Date) => (new Date(date.getFullYear(), date.getMonth(), 1).getDay() + 6) % 7;

  const isBooked = (dateStr: string) => 
    bookings.some(b => 
      b.apartmentId === aptId && 
      dateStr >= b.startDate && 
      dateStr < b.endDate && 
      (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID)
    );

  const isBlockedManually = (dateStr: string) => 
    blockedDates.some(d => d.apartmentId === aptId && new Date(d.date).toISOString().split('T')[0] === dateStr);

  const isAirbnbBlocked = (dateStr: string) => airbnbCalendarDates.includes(dateStr);

  const renderMonth = (monthDate: Date) => {
    const days = [];
    const numDays = daysInMonth(monthDate);
    const offset = startOffset(monthDate);
    const monthName = monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    for (let i = 0; i < offset; i++) days.push(<div key={`e-${i}`} />);

    for (let d = 1; d <= numDays; d++) {
      const dateObj = new Date(monthDate.getFullYear(), monthDate.getMonth(), d);
      
      const year = dateObj.getFullYear();
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const day = dateObj.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const booked = isBooked(dateStr);
      const blockedManually = isBlockedManually(dateStr);
      const airbnbBlocked = isAirbnbBlocked(dateStr);

      let dayClass = 'bg-stone-900 border-stone-700 text-stone-200 hover:text-white';
      
      if (booked) { 
        dayClass = 'bg-blue-500/20 border-blue-500/40 text-blue-500'; 
      } else if (blockedManually) { 
        dayClass = 'bg-rose-500/20 border-rose-500/40 text-rose-500'; 
      } else if (airbnbBlocked) {
        dayClass = 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500'; 
      }

      days.push(
        <button
          key={dateStr}
          onClick={() => onToggle(dateStr)}
          className={`h-12 flex flex-col items-center justify-center text-[10px] font-bold rounded-xl border transition-all ${dayClass}`}
        >
          {d}
        </button>
      );
    }

    return (
      <div className="p-8 bg-[#1c1a19] rounded-[2rem] border" style={{ borderColor: CARD_BORDER }}>
        <div className="flex items-center justify-between mb-8">
           <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="text-stone-500 hover:text-white transition-colors"><ChevronLeft className="w-5 h-5" /></button>
           <h4 className="text-white font-serif text-lg font-bold">{monthName}</h4>
           <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="text-stone-500 hover:text-white transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1.5 mb-2 text-[9px] font-black uppercase tracking-widest text-stone-400 text-center">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <div key={d} className="capitalize">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
            {loadingIcal && (
                <div className="col-span-full h-24 flex items-center justify-center bg-stone-900/50 rounded-lg">
                    <div className="w-8 h-8 border-2 border-stone-700 border-t-white rounded-full animate-spin"></div>
                </div>
            )}
            {!loadingIcal && days}
        </div>
        <div className="mt-8 pt-6 border-t border-stone-800/60 flex flex-wrap gap-4 justify-center text-[10px] uppercase tracking-widest font-bold">
            <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500/20 border border-blue-500/40"></span>
                <span className="text-blue-500/70">sanctum Booked</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500/40"></span>
                <span className="text-rose-500/70">Manual Block</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40"></span>
                <span className="text-yellow-500/70">Airbnb Sync</span>
            </div>
        </div>
      </div>
    );
  };

  return renderMonth(currentMonth);
};

export default AvailabilityCalendar;
