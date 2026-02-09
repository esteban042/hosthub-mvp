
import React from 'react';
import { CheckCircle, Briefcase, Users, Hash, ArrowRight, DollarSign, Calendar, Home, CreditCard } from 'lucide-react';
import { Booking, Apartment, Host } from '../types';

interface BookingConfirmationCardProps {
  booking: Booking;
  apartment: Apartment;
  host: Host;
  onClose: () => void;
}

const InfoRow: React.FC<{ icon: React.ElementType, label: string, value: string | number }> = ({ icon: Icon, label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-700/60 last:border-none">
    <div className="flex items-center space-x-3 text-gray-300">
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </div>
    <span className="font-bold text-white text-lg">{value}</span>
  </div>
);

const InfoBlock: React.FC<{ icon: React.ElementType, title: string, content: string | undefined }> = ({ icon: Icon, title, content }) => {
  if (!content) return null;
  return (
    <div className="bg-gray-900/70 p-6 rounded-xl border border-gray-700/60 space-y-4">
      <div className="flex items-center space-x-3 text-teal-400">
        <Icon size={20} />
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <p className="text-gray-300 whitespace-pre-line leading-relaxed">
        {content}
      </p>
    </div>
  );
};


export const BookingConfirmationCard: React.FC<BookingConfirmationCardProps> = ({ booking, apartment, host, onClose }) => {
  if (!booking) return null;

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-gray-800 border border-teal-500/30 rounded-2xl shadow-2xl max-w-2xl w-full text-gray-200 font-sans animate-in zoom-in-95 duration-500">
        <div className="p-8 space-y-8">
          <header className="text-center space-y-3">
            <CheckCircle size={50} className="mx-auto text-teal-400 bg-teal-900/50 p-2 rounded-full" />
            <h1 className="text-4xl font-bold text-white tracking-tight">Booking confirmed!</h1>
            <p className="text-gray-400 text-lg">Your booking was successful and sent to you per email.</p>
          </header>

          <div className="bg-gray-900/70 p-6 rounded-xl border border-gray-700/60">
            <InfoRow icon={Hash} label="Booking ID" value={booking.customBookingId || 'N/A'} />
            <InfoRow icon={Home} label="Apartment" value={apartment.title} />
            <InfoRow icon={Briefcase} label="Host" value={host.name} />
            <div className="flex justify-between items-center py-4 border-b border-gray-700/60">
              <div className="flex items-center space-x-3 text-gray-300">
                <Calendar size={18} />
                <span className="font-medium">Dates</span>
              </div>
              <div className="flex items-center space-x-2 font-bold text-white text-lg">
                <span>{formatDate(booking.startDate)}</span>
                <ArrowRight size={20} className="text-teal-400"/>
                <span>{formatDate(booking.endDate)}</span>
              </div>
            </div>
            <InfoRow icon={Users} label="Number of Guests" value={booking.numGuests} />
            <InfoRow icon={DollarSign} label="Total Price" value={`$${booking.totalPrice.toFixed(2)}`} />
          </div>

          <InfoBlock 
            icon={CreditCard} 
            title="Next Steps & Payment"
            content={host.paymentInstructions}
          />

          <footer className="text-center space-y-4">
            
            <button
              onClick={onClose}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 w-full md:w-auto"
            >
              Close
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};
