import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Booking, BookingStatus } from '../../types';
import { Building, CalendarDays, Users, DollarSign, Mail, Phone, MessageSquare, Printer, KeySquare, LogIn, LogOut } from 'lucide-react';
import { formatBookingRange } from '../../utils/formatBookingRange';
import { getGuestDisplayName } from '../../utils/bookingUtils';
import MessageMenu from '../MessageMenu';

const getStatusBadgeStyle = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.PAID:
      return 'bg-emerald-accent/10 text-green-600 border-green-600';
    case BookingStatus.CONFIRMED:
      return 'bg-sky-700/10 text-sky-700 border-sky-700/60';
    default:
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  }
};

const BookingInfoLine: React.FC<{ icon: React.ReactNode; text: React.ReactNode; isBold?: boolean }> = ({ icon, text, isBold }) => (
  <div className="flex items-center space-x-3">
    {icon}
    <span className={isBold ? 'font-bold text-charcoal' : 'text-charcoal/80'}>{text}</span>
  </div>
);

const BookingCard: React.FC<{
  booking: Booking;
  apartmentTitle: string;
  onUpdateStatus: (booking: Booking, newStatus: BookingStatus) => void;
  onSendMessage: (booking: Booking) => void;
  onSendCheckInMessage: (booking: Booking) => void;
  onSendWelcomeMessage: (booking: Booking) => void;
  onSendCheckoutMessage: (booking: Booking) => void;
  statusFilter: string;
  showButtons?: boolean;
}> = ({ booking: b, apartmentTitle, onUpdateStatus: handleUpdateStatus, onSendMessage, onSendCheckInMessage, onSendWelcomeMessage, onSendCheckoutMessage, statusFilter, showButtons = true }) => {
  const [isMessageMenuOpen, setIsMessageMenuOpen] = useState(false);
  const guestDisplayName = getGuestDisplayName(b.guestName, b.guestEmail);

  return (
    <div key={b.id} className="bg-white/50 rounded-2xl overflow-hidden shadow-xl border flex flex-col hover:border-emerald-accent/30 transition-all border-charcoal/10">
      <div className="p-6 flex-grow">
        <div className="flex items-start justify-between mb-4">
          <h4 className="text-xl font-bold text-charcoal leading-tight">{guestDisplayName}</h4>
          <div className="flex items-center space-x-2">
            <Link to={`/booking/print/${b.id}`} target="_blank" className="text-stone-400 hover:text-sky-700 transition-colors">
                <Printer className="w-5 h-5" />
            </Link>
            <span className={`px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-black border ${getStatusBadgeStyle(b.status)}`}>
                {b.status}
            </span>
          </div>
        </div>

        {!showButtons && (
            <div className="flex items-center space-x-3 text-m mb-6">
                <Building className="w-4 h-4 text-charcoal/80" />
                <span className="text-charcoal/80 font-medium">{apartmentTitle}</span>
            </div>
        )}

        <div className="space-y-3 text-sm text-charcoal/60">
          <BookingInfoLine icon={<CalendarDays className="w-4 h-4 flex-shrink-0" />} text={formatBookingRange(b.startDate, b.endDate)} isBold />
          <BookingInfoLine icon={<Users className="w-4 h-4 flex-shrink-0" />} text={`${b.numGuests || 1} Guests`} />
          <BookingInfoLine icon={<DollarSign className="w-4 h-4 flex-shrink-0" />} text={`$${b.totalPrice.toLocaleString()} Total`} />
          <BookingInfoLine icon={<Mail className="w-4 h-4 flex-shrink-0" />} text={<span className="truncate">{b.guestEmail}</span>} />
          {b.guestPhone && <BookingInfoLine icon={<Phone className="w-4 h-4 flex-shrink-0" />} text={b.guestPhone} />}
        </div>
      </div>
      {showButtons && (
        <div className="border-t border-charcoal/10 p-4 flex items-center justify-center space-x-2">
          <div className="relative">
            <button 
              onClick={() => setIsMessageMenuOpen(!isMessageMenuOpen)} 
              className="flex-shrink-0 bg-transparent border border-sky-600 text-sky-600 p-3 rounded-xl hover:bg-sky-600/10 hover:text-white transition-all"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            {isMessageMenuOpen && (
              <MessageMenu
                booking={b}
                onSendMessage={onSendMessage}
                onSendWelcomeMessage={onSendWelcomeMessage}
                onSendCheckInMessage={onSendCheckInMessage}
                onSendCheckoutMessage={onSendCheckoutMessage}
                onClose={() => setIsMessageMenuOpen(false)}
              />
            )}
            </div>
            <div className="flex-grow flex items-center justify-center space-x-2">
                {statusFilter !== 'past' && b.status === BookingStatus.CONFIRMED && (
                    <>
                    <button 
                      onClick={() => handleUpdateStatus(b, BookingStatus.PAID)} 
                      className="flex-1 bg-transparent border border-green-600  text-green-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center"
                    >
                      Mark as Paid
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(b, BookingStatus.CANCELED)} 
                      className="flex-1 bg-transparent border border-rose-600 text-rose-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all text-center"
                    >
                      Cancel
                    </button>
                    </>
                )}
                {statusFilter !== 'past' && b.status === BookingStatus.PAID && (
                    <button 
                      onClick={() => handleUpdateStatus(b, BookingStatus.CANCELED)} 
                      className="w-full bg-transparent border border-rose-600 text-rose-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all text-center"
                    >
                      Cancel
                    </button>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
