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
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

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
        (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.REQUESTED || b.status === BookingStatus.PAID) &&
        dateStr >= b.startDate && dateStr < b.endDate
    );

  const isBlockedManually = (dateStr: string) =>
    allBlockedDates.some(
      (d) =>
        (d.apartmentId === apartment?.id || d.apartmentId === 'all') &&
        d.date === dateStr
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
    const year = month.getFullYear();
    const monthNum = month.getMonth();
    const dStr = `${year}-${String(monthNum + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const isPast = dStr < todayStr;
    
    const isSelected = dStr === startDate || dStr === endDate;
    const inRange = startDate && endDate && dStr >= startDate && dStr <= endDate;
    const price = getPriceForDate(dStr);

    const isCurrentlyBooked = isBooked(dStr);
    const isCurrentlyBlockedManually = isBlockedManually(dStr);
    const isCurrentlyAirbnbBlocked = isAirbnbBlocked(dStr);

    const isUnavailable = isCurrentlyBooked || isCurrentlyBlockedManually || isCurrentlyAirbnbBlocked || isPast;

    let dayClass = 'text-stone-300 hover:bg-stone-800'; 
    
    if (isSelected) {
      dayClass = 'bg-coral-500 text-white border-coral-500';
    } else if (inRange) {
      dayClass = 'bg-coral-500/20 text-coral-500 border-coral-500/10';
    } else if (isUnavailable) {
      dayClass = 'bg-stone-900 border-stone-800 text-stone-600 cursor-not-allowed line-through'; 
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
        {price !== null && <span className={`text-[8px] font-medium ${isUnavailable ? 'text-stone-700' : isSelected ? 'text-white/80' : 'text-stone-500'}`}>${price}</span>}
      </button>
    );
  }

  return (
    <div className={`p-6 bg-stone-950 border border-stone-800 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 ${apartment ? 'w-full' : 'w-[320px]'}`}>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="text-stone-500 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7"/></svg></button>
        <span className="text-white font-serif font-bold text-sm">{month.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="text-stone-500 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7"/></svg></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-[9px] font-black text-stone-600 text-center mb-2 uppercase tracking-widest">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">{days}</div>
    </div>
  );
};

export default HeroCalendar;
