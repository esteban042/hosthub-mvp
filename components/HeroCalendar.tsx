
import React, { useState } from 'react';
import { Apartment, Booking, BlockedDate, BookingStatus, PriceRule } from '../types';

interface HeroCalendarProps {
    apartment?: Apartment;
    startDate: string;
    endDate: string;
    onSelect: (startDate: string, endDate: string) => void;
    allBookings: Booking[];
    allBlockedDates: BlockedDate[];
    airbnbBlockedDates: string[];
}

// Helper to format a date as YYYY-MM-DD in the local timezone
const toLocalISOString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const HeroCalendar: React.FC<HeroCalendarProps> = ({ apartment, startDate, endDate, onSelect, allBookings, allBlockedDates, airbnbBlockedDates }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [hoveredDate, setHoveredDate] = useState<string | null>(null);
    
    const todayStr = toLocalISOString(new Date());

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
            (d) => (d.apartmentId === apartment?.id || d.apartmentId === 'all') && d.date === dateStr
        );
    
    const isAirbnbBlocked = (dateStr: string) => airbnbBlockedDates.includes(dateStr);
    
    const handleDayClick = (dateStr: string) => {
        if (dateStr < todayStr) return;
    
        if (!startDate || (startDate && endDate)) {
          onSelect(dateStr, '');
        } else {
          if (dateStr < startDate) {
            onSelect(dateStr, '');
          } else {
            let current = new Date(startDate);
            const [endYear, endMonth, endDay] = dateStr.split('-').map(Number);
            let end = new Date(endYear, endMonth - 1, endDay);

            let isRangeBlocked = false;
            while(current <= end) {
              const d = toLocalISOString(current);
              if (isBooked(d) || isBlockedManually(d) || isAirbnbBlocked(d)) {
                isRangeBlocked = true;
                break;
              }
              current.setDate(current.getDate() + 1);
            }
    
            if (isRangeBlocked) {
              onSelect(dateStr, '');
            } else {
              onSelect(startDate, dateStr);
            }
          }
        }
    };

    const renderMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} />);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(year, month, i);
            const dateStr = toLocalISOString(dayDate);

            const isDisabled = dateStr < todayStr || isBooked(dateStr) || isBlockedManually(dateStr) || isAirbnbBlocked(dateStr);
            const isSelected = (startDate && dateStr === startDate) || (endDate && dateStr === endDate);
            const isInRange = startDate && endDate && dateStr > startDate && dateStr < endDate;
            const isHovering = startDate && !endDate && hoveredDate && dateStr > startDate && dateStr <= hoveredDate;

            days.push(
                <div 
                    key={dateStr} 
                    onMouseEnter={() => !isDisabled && setHoveredDate(dateStr)}
                    onMouseLeave={() => setHoveredDate(null)}
                    onClick={() => !isDisabled && handleDayClick(dateStr)}
                    className={`
                        relative text-center text-sm rounded-full aspect-square flex flex-col items-center justify-center p-1
                        ${!isDisabled ? 'cursor-pointer hover:bg-stone-200' : ''}
                        ${isSelected ? 'bg-cyan-700/40 text-white' : ''}
                        ${isInRange || isHovering ? 'bg-cyan-700/20' : ''}
                        ${isDisabled ? 'text-stone-300' : 'text-charcoal'}
                        ${dateStr === startDate ? 'rounded-r-none' : ''}
                        ${dateStr === endDate ? 'rounded-l-none' : ''}
                    `}
                >
                    <span className={`${isDisabled ? 'line-through' : ''}`}>{i}</span>
                    {apartment && !isDisabled && (
                        <span className={`text-[10px] font-bold mt-[-2px] ${isSelected ? 'text-white/70' : 'text-stone-500'}`}>
                            ${getPriceForDate(dateStr)}
                        </span>
                    )}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="w-full bg-white p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                  className="p-2 rounded-full hover:bg-stone-100"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="text-lg font-bold text-charcoal">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                  className="p-2 rounded-full hover:bg-stone-100"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 place-items-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-center text-xs font-bold text-stone-400 w-full pb-2">{d}</div>)}
                {renderMonth(currentMonth)}
            </div>
        </div>
    );
};

export default HeroCalendar;
