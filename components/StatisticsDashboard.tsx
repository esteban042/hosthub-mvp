
import React, { useState, useMemo } from 'react';
import { Apartment, Booking, BookingStatus } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';


const StatisticsDashboard: React.FC<{ myApartments: Apartment[], myBookings: Booking[] }> = ({ myApartments, myBookings }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthlyStats = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    return myApartments.map(apt => {
      const bookingsInMonth = myBookings.filter(b => {
        const bookingDate = new Date(b.startDate);
        return b.apartmentId === apt.id &&
               bookingDate.getFullYear() === year &&
               bookingDate.getMonth() === month &&
               (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID);
      });

      const totalRevenue = bookingsInMonth.reduce((sum, b) => sum + b.totalPrice, 0);

      return {
        aptId: apt.id,
        aptTitle: apt.title,
        bookingsCount: bookingsInMonth.length,
        totalRevenue: totalRevenue,
      };
    });
  }, [myApartments, myBookings, currentMonth]);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <button onClick={goToPreviousMonth} className="text-stone-500 hover:text-white transition-colors"><ChevronLeft className="w-5 h-5" /></button>
        <h4 className="text-white font-serif text-lg font-bold">{currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</h4>
        <button onClick={goToNextMonth} className="text-stone-500 hover:text-white transition-colors"><ChevronRight className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {monthlyStats.map(stat => (
          <div key={stat.aptId} className="bg-stone-900 border border-stone-700 rounded-xl p-6">
            <h5 className="text-lg font-bold text-white mb-4">{stat.aptTitle}</h5>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Bookings</p>
                <p className="text-2xl font-bold text-white">{stat.bookingsCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 text-right">Revenue</p>
                <p className="text-2xl font-bold text-emerald-400 text-right">${stat.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticsDashboard;
