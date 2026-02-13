
import React, { useState } from 'react';
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

  const isBlocked = (day: Date, apartmentId: string) => {
    return blockedDates.some(blockedDate =>
      blockedDate.apartmentId === apartmentId &&
      format(new Date(blockedDate.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
  };

  return (
    <div className="bg-stone-900/70 text-white rounded-xl p-4 font-sans overflow-x-auto backdrop-blur-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-stone-700">
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-stone-700">
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid" style={{ gridTemplateColumns: `minmax(150px, 1fr) repeat(${daysInMonth.length}, minmax(50px, 1fr))` }}>
        {/* Apartment Column Header */}
        <div className="sticky left-0 bg-stone-900/70 z-20 p-2 border-r border-b border-stone-700 font-semibold backdrop-blur-sm">Apartment</div>
        {/* Days Header */}
        {daysInMonth.map(day => (
          <div key={day.toString()} className="text-center p-2 border-b border-stone-700">
            <div className="text-xs text-stone-400">{format(day, 'E')}</div>
            <div>{format(day, 'dd')}</div>
          </div>
        ))}

        {/* Apartment Rows */}
        {apartments.map(apt => (
          <React.Fragment key={apt.id}>
            <div className="sticky left-0 bg-stone-900/70 z-10 p-2 border-r border-t border-stone-700 font-semibold flex items-center backdrop-blur-sm">
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
                    <div key={day.toString()} className="p-1 border-t border-stone-700" style={{ gridColumn: `span ${clampedDuration}` }}>
                      <div className="bg-blue-500 rounded-lg p-2 text-sm truncate h-full flex items-center">
                        {booking.guestName}
                      </div>
                    </div>
                  );
                  i += clampedDuration;
                } else {
                  const blocked = isBlocked(day, apt.id);
                  const cellClasses = [
                      "border-t",
                      "border-stone-700",
                      "cursor-pointer",
                      "transition-colors",
                      "duration-150",
                      "ease-in-out",
                      "relative",
                      blocked ? "bg-red-800/50 hover:bg-red-700/60" : "hover:bg-stone-700",
                  ].filter(Boolean).join(" ");

                  cells.push(
                      <div
                          key={day.toString()}
                          className={cellClasses}
                          onClick={() => onToggleBlock(apt.id, day)}
                      >
                         {blocked && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <XMarkIcon className="h-5 w-5 text-white/70" />
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
  );
};

export default TimelineCalendar;
