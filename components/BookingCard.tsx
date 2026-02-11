import React from 'react';
import { Booking, BookingStatus } from '../types';
import { CalendarDays, Users, DollarSign, Mail, Phone } from 'lucide-react';
import { formatBookingRange } from '../utils/formatBookingRange.tsx';
import { CARD_BORDER } from '../constants.tsx';

const LABEL_COLOR = 'rgb(168, 162, 158)';

const BookingCard: React.FC<{
  booking: Booking;
  apartmentTitle: string;
  onUpdateStatus: (booking: Booking, newStatus: BookingStatus) => void;
  statusFilter: string;
  showButtons?: boolean;
}> = ({ booking: b, apartmentTitle, onUpdateStatus: handleUpdateStatus, statusFilter, showButtons = true }) => {
  return (
    <div key={b.id} className="bg-[#1c1a19] rounded-2xl overflow-hidden shadow-xl border flex flex-col hover:border-emerald-500/30 transition-all" style={{ borderColor: CARD_BORDER }}>
      <div className="p-6 flex-grow">
        <div className="flex items-start justify-between mb-6">
          <h4 className="text-xl font-bold text-white leading-tight">{b.guestName || (b.guestEmail.split('@')[0].charAt(0).toUpperCase() + b.guestEmail.split('@')[0].slice(1))}</h4>
          <span className={`px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-black border ${
            b.status === BookingStatus.PAID ? 'bg-emerald-500/05 text-emerald-400 border-emerald-500/80' :
            b.status === BookingStatus.CONFIRMED ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
            'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>{b.status}</span>
        </div>

        <div className="space-y-3 text-sm" style={{ color: LABEL_COLOR }}>
          <div className="flex items-center space-x-3">
            <CalendarDays className="w-4 h-4 flex-shrink-0" />
            <span className="font-bold text-[rgb(214,213,213)]">{formatBookingRange(b.startDate, b.endDate)}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span>{b.numGuests || 1} Guests</span>
          </div>
          <div className="flex items-center space-x-3">
            <DollarSign className="w-4 h-4 flex-shrink-0" />
            <span>${b.totalPrice.toLocaleString()} Total</span>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{b.guestEmail}</span>
          </div>
          {b.guestPhone && (
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>{b.guestPhone}</span>
            </div>
          )}
        </div>
      </div>
      {showButtons && (
        <div className="border-t border-stone-800/60 p-4 flex items-center justify-center space-x-2">
          {statusFilter !== 'past' && b.status === BookingStatus.CONFIRMED && (
            <>
              <button onClick={() => handleUpdateStatus(b, BookingStatus.PAID)} className="flex-1 bg-transparent border border-emerald-500 text-emerald-400 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/10 hover:text-emerald-300 transition-all text-center">Mark as Paid</button>
              <button onClick={() => handleUpdateStatus(b, BookingStatus.CANCELED)} className="flex-1 bg-transparent border border-rose-600 text-rose-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-rose-500 hover:text-rose-400 transition-all text-center">Cancel</button>
            </>
          )}
          {statusFilter !== 'past' && b.status === BookingStatus.PAID && (
            <button onClick={() => handleUpdateStatus(b, BookingStatus.CANCELED)} className="w-full bg-transparent border border-rose-600 text-rose-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-rose-500 hover:text-rose-400 transition-all text-center">Cancel</button>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingCard;
