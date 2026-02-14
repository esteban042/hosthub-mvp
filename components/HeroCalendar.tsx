import React, { useState } from 'react';
import { Apartment, Booking, BlockedDate, BookingStatus, PriceRule } from '../types';

export const HeroCalendar: React.FC<{ 
  onSelect: (start: string, end: string) => void,
  startDate: string,
  endDate: string,
  apartment?: Apartment, 
  allBookings: Booking[], 
  allBlockedDates: BlockedDate[], 
  airbnbBlockedDates: string[], 
}> = ({ onSelect, startDate, endDate, apartment, allBookings, allBlockedDates, airbnbBlockedDates }) => {
  const [month, setMonth] = useState(new Date());
  
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const offset = new Date(month.getFullYear(), month.getMonth(), 1).getDay();

  const getPriceForDate = (dateStr: string) => {
    if (!apartment) return null;
    const override = apartment.priceOverrides?.find((rule: PriceRule) => dateStr >= rule.startDate && dateStr <= rule.endDate);
    return override ? override.price : (apartment.pricePerNight || 0);
  };

  const isBooked = (dateStr: string) =>
    allBookings.some(
      (b) =>
        b.apartmentId === apartment?.id &&
        (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID) &&
        dateStr >= b.startDate && dateStr < b.endDate
    );

  const isBlockedManually = (dateStr: string) =>
    allBlockedDates.some(
      (d) =>
        (d.apartmentId === apartment?.id || d.apartmentId === 'all') &&
        new Date(d.date).toISOString().split('T')[0] === dateStr
    );

  const isAirbnbBlocked = (dateStr: string) => airbnbBlockedDates.includes(dateStr);

  const handleDayClick = (dateStr: string) => {
    if (dateStr < todayStr) return;

    const isDayUnavailable = isBooked(dateStr) || isBlockedManually(dateStr) || isAirbnbBlocked(dateStr);
    if (isDayUnavailable) return;

    if (!startDate || (startDate && endDate)) {
      onSelect(dateStr, '');
    } else {
      if (dateStr < startDate) {
        onSelect(dateStr, '');
      } else {
        const start = new Date(startDate);
        const end = new Date(dateStr);
        let current = new Date(start);
        current.setUTCDate(current.getUTCDate() + 1);

        let isRangeValid = true;
        while(current < end) {
          const currentStr = current.toISOString().split('T')[0];
          if (isBooked(currentStr) || isBlockedManually(currentStr) || isAirbnbBlocked(currentStr)) {
            isRangeValid = false;
            break;
          }
          current.setUTCDate(current.getUTCDate() + 1);
        }

        if(isRangeValid) {
          onSelect(startDate, dateStr);
        } else {
          onSelect(dateStr, '');
        }
      }
    }
  };


  const days = [];
  for (let i = 0; i < offset; i++) days.push(<div key={`e-${i}`} />);
  for (let d = 1; d <= daysInMonth(month); d++) {
    const dayDate = new Date(Date.UTC(month.getFullYear(), month.getMonth(), d));
    const dStr = dayDate.toISOString().split('T')[0];

    const isPast = dStr < todayStr;
    
    const isSelected = dStr === startDate || dStr === endDate;
    const inRange = startDate && endDate && dStr > startDate && dStr < endDate;
    const price = getPriceForDate(dStr);

    const isCurrentlyBooked = isBooked(dStr);
    const isCurrentlyBlockedManually = isBlockedManually(dStr);
    const isCurrentlyAirbnbBlocked = isAirbnbBlocked(dStr);

    const isUnavailable = isCurrentlyBooked || isCurrentlyBlockedManually || isCurrentlyAirbnbBlocked || isPast;

    let dayClass = 'text-charcoal hover:bg-stone-200'; 
    
    if (isSelected) {
      dayClass = 'bg-sky-500 text-white';
    } else if (inRange) {
      dayClass = 'bg-sky-500/20 text-sky-700';
    } else if (isUnavailable) {
      dayClass = 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed line-through'; 
    }

    days.push(
      <button 
        key={dStr} onClick={() => handleDayClick(dStr)}
        disabled={isUnavailable} 
        className={`flex flex-col items-center justify-center rounded-xl transition-all ${
          apartment ? 'h-14 w-full border border-transparent' : 'h-10 w-10'
        } ${dayClass}`}
      >
        <span className={`${apartment ? 'text-[11px] font-bold' : 'text-xs font-bold'}`}>{d}</span>
        {price !== null && <span className={`text-[8px] font-medium ${isUnavailable ? 'text-stone-400' : isSelected ? 'text-white/80' : 'text-charcoal/50'}`}>${price}</span>}
      </button>
    );
  }

  return (
    <div className={`p-6 bg-alabaster border border-stone-200 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 ${apartment ? 'w-full' : 'w-[320px]'}`}>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="text-charcoal/50 hover:text-charcoal transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7"/></svg></button>
        <span className="text-charcoal font-serif font-bold text-sm">{month.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="text-charcoal/50 hover:text-charcoal transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7"/></svg></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-[9px] font-black text-charcoal/50 text-center mb-2 uppercase tracking-widest">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">{days}</div>
    </div>
  );
};

export default HeroCalendar;
