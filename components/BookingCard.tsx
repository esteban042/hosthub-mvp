
import React from 'react';
import { Booking, BookingStatus } from '../types';
import { Building, CalendarDays, Users, DollarSign, Mail, Phone, MessageSquare } from 'lucide-react';
import { formatBookingRange } from '../utils/formatBookingRange';
import { getGuestDisplayName } from '../utils/bookingUtils';
import { CARD_BORDER } from '../constants';

const LABEL_COLOR = 'rgb(168, 162, 158)';

const getStatusBadgeStyle = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.PAID:
      return 'bg-emerald-500/5 text-emerald-400 border-emerald-500/80';
    case BookingStatus.CONFIRMED:
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    default:
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  }
};

const BookingInfoLine: React.FC<{ icon: React.ReactNode; text: React.ReactNode; isBold?: boolean }> = ({ icon, text, isBold }) => (
  <div className="flex items-center space-x-3">
    {icon}
    <span className={isBold ? 'font-bold text-[rgb(214,213,213)]' : ''}>{text}</span>
  </div>
);

const BookingCard: React.FC<{
  booking: Booking;
  apartmentTitle: string;
  onUpdateStatus: (booking: Booking, newStatus: BookingStatus) => void;
  onSendMessage: (booking: Booking) => void;
  statusFilter: string;
  showButtons?: boolean;
}> = ({ booking: b, apartmentTitle, onUpdateStatus: handleUpdateStatus, onSendMessage, statusFilter, showButtons = true }) => {
  const guestDisplayName = getGuestDisplayName(b.guestName, b.guestEmail);

  return (
    <div key={b.id} className="bg-[#1c1a19] rounded-2xl overflow-hidden shadow-xl border flex flex-col hover:border-emerald-500/30 transition-all" style={{ borderColor: CARD_BORDER }}>
      <div className="p-6 flex-grow">
        <div className="flex items-start justify-between mb-4">
          <h4 className="text-xl font-bold text-white leading-tight">{guestDisplayName}</h4>
          <span className={`px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-black border ${getStatusBadgeStyle(b.status)}`}>
            {b.status}
          </span>
        </div>

        {!showButtons && (
            <div className="flex items-center space-x-3 text-m mb-6">
                <Building className="w-4 h-4 text-[rgb(214,213,213)]" />
                <span className="text-[rgb(214,213,213)] font-medium">{apartmentTitle}</span>
            </div>
        )}

        <div className="space-y-3 text-sm" style={{ color: LABEL_COLOR }}>
          <BookingInfoLine icon={<CalendarDays className="w-4 h-4 flex-shrink-0" />} text={formatBookingRange(b.startDate, b.endDate)} isBold />
          <BookingInfoLine icon={<Users className="w-4 h-4 flex-shrink-0" />} text={`${b.numGuests || 1} Guests`} />
          <BookingInfoLine icon={<DollarSign className="w-4 h-4 flex-shrink-0" />} text={`$${b.totalPrice.toLocaleString()} Total`} />
          <BookingInfoLine icon={<Mail className="w-4 h-4 flex-shrink-0" />} text={<span className="truncate">{b.guestEmail}</span>} />
          {b.guestPhone && <BookingInfoLine icon={<Phone className="w-4 h-4 flex-shrink-0" />} text={b.guestPhone} />}
        </div>
      </div>
      {showButtons && (
        <div className="border-t border-stone-800/60 p-4 flex items-center justify-center space-x-2">
            {statusFilter !== 'past' && b.status !== BookingStatus.CANCELED && (
                <button 
                onClick={() => onSendMessage(b)} 
                className="flex-shrink-0 bg-transparent border border-sky-500 text-sky-400 p-3 rounded-xl hover:bg-sky-500/10 hover:text-sky-300 transition-all"
                >
                <MessageSquare className="w-4 h-4" />
                </button>
            )}
            <div className="flex-grow flex items-center justify-center space-x-2">
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
        </div>
      )}
    </div>
  );
};

export default BookingCard;
