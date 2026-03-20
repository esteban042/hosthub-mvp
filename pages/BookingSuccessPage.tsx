import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { sanctumApi } from '../services/api.js';
import { Booking } from '../types.js';
import { CheckCircle, User, Calendar, DollarSign, Hash, Home, CreditCard, ClipboardCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const InfoRow: React.FC<{ icon: React.ElementType, label: string, value: string | number, valueClass?: string }> = ({ icon: Icon, label, value, valueClass }) => (
    <div className="flex justify-between items-center py-3 border-b border-stone-200/60 last:border-none">
      <div className="flex items-center space-x-3 text-charcoal/80">
        <Icon size={18} />
        <span className="font-medium">{label}</span>
      </div>
      <span className={`font-bold text-charcoal text-lg ${valueClass}`}>{value}</span>
    </div>
  );

const BookingSuccessPage = () => {
  const location = useLocation();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get('session_id');

    const verifyBooking = async () => {
      if (!sessionId) {
        setError(t('booking_success.invalid_session'));
        setLoading(false);
        return;
      }

      try {
        const confirmedBooking = await sanctumApi.verifyStripeSession(sessionId);
        setBooking(confirmedBooking);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    verifyBooking();
  }, [location, t]);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(i18n.language, { month: 'long', day: 'numeric', year: 'numeric' });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">{t('booking_success.verifying')}</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">{t('booking_success.error', { error })}</div>;
  }

  if (!booking) {
    return <div className="flex justify-center items-center h-screen">{t('booking_success.no_details')}</div>;
  }

  return (
    <div className="bg-stone-50 min-h-screen flex items-center justify-center p-4">
         <div className="bg-white border border-stone-200 rounded-2xl shadow-2xl max-w-2xl w-full font-sans">
            <div className="p-8 space-y-8">
                <header className="text-center space-y-3">
                    <CheckCircle size={50} className="mx-auto text-emerald-500 bg-emerald-100 p-2 rounded-full" />
                    <h1 className="text-4xl font-bold tracking-tight">{t('booking_success.title')}</h1>
                    <p className="text-charcoal/70 text-lg">{t('booking_success.thank_you', { guestName: booking.guestName })}</p>
                    <p className="text-gray-600">{t('booking_success.confirmation_sent', { email: booking.guestEmail })}</p>
                </header>

                <div className="bg-white/50 p-6 rounded-xl border border-stone-200/60">
                    <InfoRow icon={Hash} label={t('booking_success.booking_id')} value={booking.customBookingId || t('common.not_available')} />
                    <InfoRow icon={User} label={t('booking_success.guest_name')} value={booking.guestName} />
                    {booking.apartment && <InfoRow icon={Home} label={t('booking_success.apartment')} value={booking.apartment.title} />}
                    <InfoRow icon={Calendar} label={t('booking_success.check_in')} value={formatDate(booking.startDate)} />
                    <InfoRow icon={Calendar} label={t('booking_success.check_out')} value={formatDate(booking.endDate)} />
                    <InfoRow icon={DollarSign} label={t('booking_success.total_price')} value={`$${booking.totalPrice.toFixed(2)}`} />
                    <InfoRow icon={CreditCard} label={t('booking_success.payment_status')} value={t('booking_success.paid')} valueClass="text-emerald-500" />
                    <InfoRow icon={ClipboardCheck} label={t('booking_success.booking_status')} value={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)} valueClass="text-emerald-500" />
                </div>

                <footer className="text-center">
                    <Link to="/host-dashboard" className="inline-block bg-stone-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-stone-600 transition-colors">
                        {t('booking_success.close')}
                    </Link>
                </footer>
            </div>
        </div>
    </div>
  );
};

export default BookingSuccessPage;
