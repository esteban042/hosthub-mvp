import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Briefcase, Users, Hash, ArrowRight, DollarSign, Calendar, Home, CreditCard, ClipboardCheck } from 'lucide-react';
import { Booking, Apartment, Host } from '../types.js';
import { BACKGROUND_COLOR, TEXT_COLOR, SKY_ACCENT, EMERALD_ACCENT } from '../../constants.tsx';

interface BookingConfirmationCardProps {
  booking: Booking;
  apartment: Apartment;
  host: Host;
  onClose: () => void;
}

const InfoRow: React.FC<{ icon: React.ElementType, label: string, value: string | number, valueClass?: string }> = ({ icon: Icon, label, value, valueClass }) => (
  <div className="flex justify-between items-center py-3 border-b border-stone-200/60 last:border-none">
    <div className="flex items-center space-x-3 text-charcoal/80">
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </div>
    <span className={`font-bold text-charcoal text-lg ${valueClass}`}>{value}</span>
  </div>
);

const InfoBlock: React.FC<{ icon: React.ElementType, title: string, content: string | undefined }> = ({ icon: Icon, title, content }) => {
  if (!content) return null;
  return (
    <div className="bg-white/50 p-6 rounded-xl border border-stone-200/60 space-y-4">
      <div className="flex items-center space-x-3 text-sky-accent">
        <Icon size={20} />
        <h3 className="text-xl font-bold text-charcoal">{title}</h3>
      </div>
      <p className="text-charcoal/80 whitespace-pre-line leading-relaxed">
        {content}
      </p>
    </div>
  );
};

export const BookingConfirmationCard: React.FC<BookingConfirmationCardProps> = ({ booking, apartment, host, onClose }) => {
  const { t, i18n } = useTranslation();
  if (!booking) return null;

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(i18n.language, { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div style={{ backgroundColor: BACKGROUND_COLOR, color: TEXT_COLOR }} className="border border-stone-200 rounded-2xl shadow-2xl max-w-2xl w-full font-sans animate-in zoom-in-95 duration-500">
        <div className="p-8 space-y-8">
          <header className="text-center space-y-3">
            <CheckCircle size={50} className="mx-auto text-emerald-accent bg-emerald-accent/10 p-2 rounded-full" />
            <h1 className="text-4xl font-bold tracking-tight">{t('booking_confirmation.title')}</h1>
            <p className="text-charcoal/70 text-lg">{t('booking_confirmation.subtitle')}</p>
          </header>

          <div className="bg-white/50 p-6 rounded-xl border border-stone-200/60">
            <InfoRow icon={Hash} label={t('booking_confirmation.booking_id')} value={booking.customBookingId || t('common.not_available')} />
            <InfoRow icon={Home} label={t('booking_confirmation.apartment')} value={apartment.title} />
            <InfoRow icon={Briefcase} label={t('booking_confirmation.host')} value={host.name} />
            <InfoRow icon={Calendar} label={t('booking_confirmation.check_in_date')} value={formatDate(booking.startDate)} />
            <InfoRow icon={Calendar} label={t('booking_confirmation.check_out_date')} value={formatDate(booking.endDate)} />
            <InfoRow icon={Users} label={t('booking_confirmation.num_guests')} value={booking.numGuests} />
            <InfoRow icon={DollarSign} label={t('booking_confirmation.total_price')} value={`$${booking.totalPrice.toFixed(2)}`} />
            {booking.depositAmount && booking.depositAmount > 0 && (
              <InfoRow icon={DollarSign} label={t('booking_confirmation.deposit_amount')} value={`$${booking.depositAmount.toFixed(2)}`} />
            )}
            <InfoRow icon={ClipboardCheck} label={t('booking_confirmation.booking_status')} value={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)} valueClass="text-emerald-500" />
          </div>

          <InfoBlock 
            icon={CreditCard} 
            title={t('booking_confirmation.next_steps_title')}
            content={host.paymentInstructions}
          />

          <footer className="text-center space-y-4">
            
            <button
              onClick={onClose}
              style={{ backgroundColor: SKY_ACCENT }}
              className="hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 w-full md:w-auto"
            >
              {t('booking_confirmation.close_button')}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};
