import React from 'react';
import { Booking, BookingStatus } from '../types';
import { CalendarDays, Users, Mail, Phone } from 'lucide-react';
import { formatBookingRange } from './utils';
import { CARD_BORDER } from '../pages/GuestLandingPage';

const LABEL_COLOR = 'rgb(168, 162, 158)';

const BookingListItem: React.FC<{
  booking: Booking;
  apartmentTitle: string;
  statusFilter: string;
  onUpdateStatus: (booking: Booking, newStatus: BookingStatus) => void;
}> = ({ booking: b, apartmentTitle, statusFilter, onUpdateStatus: handleUpdateStatus }) => {
  return (
    <div key={b.id} className="w-full bg-[#1c1a19] rounded-2xl p-8 border flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all hover:border-stone-700/50" style={{ borderColor: CARD_BORDER }}>
      <div className="space-y-4 flex-1 text-left">
        <div className="flex items-center space-x-4">
          <h4 className="text-2xl font-serif text-white">{b.guestName || 'Guest'}</h4>
          <span className={`px-4 py-1.5 text-[9px] uppercase tracking-widest font-black border ${
            b.status === BookingStatus.PAID ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            b.status === BookingStatus.CONFIRMED ? 'text-blue-400 border-blue-500/40' :
            'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>{b.status}</span>
            <CalendarDays className="w-4 h-4" />
            <span className="text-l">{formatBookingRange(b.startDate, b.endDate)}</span>
            <Users className="w-4 h-4" />
            <span className="text-m">{b.numGuests || 1} Guests</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 font-medium" style={{ color: LABEL_COLOR }}>
        <div className="flex items-center space-x-2">
          <span className="text-l">{apartmentTitle}</span>
        </div>
          <div className="flex items-center space-x-2">
            <span className="text-s font-mono opacity-60">#{b.customBookingId}</span>
            </div>
          <div className="flex items-center space-x-2">
             <span className="text-ml">${b.totalPrice.toLocaleString()} Total</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 font-medium text-xs" style={{ color: LABEL_COLOR }}>
          <div className="flex items-center space-x-2">
             <Mail className="w-3.5 h-3.5" />
             <span>{b.guestEmail}</span>
          </div>
          {b.guestPhone && (
            <div className="flex items-center space-x-2">
               <Phone className="w-3.5 h-3.5" />
               <span>{b.guestPhone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingListItem;
