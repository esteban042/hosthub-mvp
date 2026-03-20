import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addDays, differenceInDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, startOfDay } from 'date-fns';
import { Booking, Apartment, BlockedDate } from '../../types';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface TimelineCalendarProps {
  apartments: Apartment[];
  bookings: Booking[];
  blockedDates: BlockedDate[];
  onToggleBlock: (apartmentId: string, date: Date) => void;
}

const TimelineCalendar: React.FC<TimelineCalendarProps> = ({ apartments, bookings, blockedDates, onToggleBlock }) => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentDate(prev => addDays(startOfMonth(prev), -1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addDays(endOfMonth(prev), 1));
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getBlockInfo = (day: Date, apartmentId: string) => {
    const blockedDate = blockedDates.find(bd =>
        bd.apartmentId === apartmentId &&
        format(new Date(bd.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
    
    if (blockedDate) {
        return { isBlocked: true, source: blockedDate.source || 'MANUAL' };
    }
    
    return { isBlocked: false, source: null };
  };

  return (
    <div className="bg-white/70 text-charcoal rounded-xl p-4 font-sans backdrop-blur-sm border border-stone-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
        
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-lg bg-sky-500/20 border border-sky-700"></div>
                <span className="text-xs font-medium">Booking</span>
            </div>
            <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-rose-200/50 border border-rose-300"></div>
                <span className="text-xs font-medium">Manual Block</span>
            </div>
            <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-amber-200/50 border border-amber-300"></div>
                <span className="text-xs font-medium">AirBnB Block</span>
            </div>
        </div>

        <div className="flex items-center">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-stone-200">
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-stone-200">
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Scrollable Grid */}
      <div className="overflow-x-auto">
        <div className="grid" style={{ gridTemplateColumns: `minmax(150px, 1fr) repeat(${daysInMonth.length}, minmax(50px, 1fr))` }}>
          {/* Apartment Column Header */}
          <div className="sticky left-0 bg-white z-20 p-2 border-r border-b border-stone-300 font-semibold">{t('host_dashboard.timeline_calendar.unit_header')}</div>
          {/* Days Header */}
          {daysInMonth.map(day => (
            <div key={day.toString()} className="text-center p-2 border-b border-stone-300">
              <div className="text-xs text-stone-500">{format(day, 'E')}</div>
              <div>{format(day, 'dd')}</div>
            </div>
          ))}

          {/* Apartment Rows */}
          {apartments.map(apt => (
            <React.Fragment key={apt.id}>
              <div className="sticky left-0 bg-white z-10 p-2 border-r border-t border-stone-300 font-semibold flex items-center">
                {apt.title}
              </div>
              {(() => {
                const cells = [];
                let i = 0;
                while (i < daysInMonth.length) {
                  const day = daysInMonth[i];
                  const booking = bookings.find(b =>
                    b.apartmentId === apt.id &&
                    format(day, 'yyyy-MM-dd') === format(new Date(b.startDate), 'yyyy-MM-dd')
                  );

                  if (booking) {
                    const startDate = startOfDay(new Date(booking.startDate));
                    const endDate = startOfDay(new Date(booking.endDate));
                    let duration = differenceInDays(endDate, startDate);
                    if (isBefore(monthEnd, endDate)) {
                      duration = differenceInDays(addDays(monthEnd, 1), startDate);
                    }
                    
                    const clampedDuration = Math.max(1, Math.min(duration, daysInMonth.length - i));

                    cells.push(
                      <div key={day.toString()} className="p-1 border-t border-stone-300" style={{ gridColumn: `span ${clampedDuration}` }}>
                        <div className="bg-sky-500/20 border border-sky-700 rounded-lg p-2 text-sm truncate h-full flex items-center text-white">
                          {booking.guestName}
                        </div>
                      </div>
                    );
                    i += clampedDuration;
                  } else {
                    const { isBlocked, source } = getBlockInfo(day, apt.id);
                    const cellClasses = [
                        "border-t",
                        "border-stone-300",
                        "cursor-pointer",
                        "transition-colors",
                        "duration-150",
                        "ease-in-out",
                        "relative",
                        isBlocked && source === 'ICAL' ? "bg-amber-200/50 hover:bg-amber-300/60" : 
                        isBlocked ? "bg-rose-200/50 hover:bg-rose-300/60" : "hover:bg-stone-200",
                    ].filter(Boolean).join(" ");

                    cells.push(
                        <div
                            key={day.toString()}
                            className={cellClasses}
                            onClick={() => onToggleBlock(apt.id, day)}
                        >
                          {isBlocked && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <XMarkIcon className={`h-5 w-5 ${source === 'ICAL' ? 'text-amber-800/70' : 'text-rose-800/70'}`} />
                              </div>
                          )}
                        </div>
                    );
                    i++;
                  }
                }
                return cells;
              })()}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineCalendar;
