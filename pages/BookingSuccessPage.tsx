import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { sanctumApi } from '../services/api.js';
import { Booking } from '../types.js';
import { CheckCircle, User, Calendar, DollarSign, Hash, Home, CreditCard, ClipboardCheck } from 'lucide-react';

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

  useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get('session_id');

    const verifyBooking = async () => {
      if (!sessionId) {
        setError('Invalid session ID.');
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
  }, [location]);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Verifying your payment...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">Error: {error}</div>;
  }

  if (!booking) {
    return <div className="flex justify-center items-center h-screen">Could not retrieve booking details.</div>;
  }

  return (
    <div className="bg-stone-50 min-h-screen flex items-center justify-center p-4">
         <div className="bg-white border border-stone-200 rounded-2xl shadow-2xl max-w-2xl w-full font-sans">
            <div className="p-8 space-y-8">
                <header className="text-center space-y-3">
                    <CheckCircle size={50} className="mx-auto text-emerald-500 bg-emerald-100 p-2 rounded-full" />
                    <h1 className="text-4xl font-bold tracking-tight">Booking Confirmed!</h1>
                    <p className="text-charcoal/70 text-lg">Thank you for your payment, {booking.guestName}.</p>
                    <p className="text-gray-600">A confirmation email has been sent to {booking.guestEmail}.</p>
                </header>

                <div className="bg-white/50 p-6 rounded-xl border border-stone-200/60">
                    <InfoRow icon={Hash} label="Booking ID" value={booking.customBookingId || 'N/A'} />
                    <InfoRow icon={User} label="Guest Name" value={booking.guestName} />
                    {booking.apartment && <InfoRow icon={Home} label="Apartment" value={booking.apartment.title} />}
                    <InfoRow icon={Calendar} label="Check-in Date" value={formatDate(booking.startDate)} />
                    <InfoRow icon={Calendar} label="Check-out Date" value={formatDate(booking.endDate)} />
                    <InfoRow icon={DollarSign} label="Total Price" value={`$${booking.totalPrice.toFixed(2)}`} />
                    <InfoRow icon={CreditCard} label="Payment Status" value="Paid" valueClass="text-emerald-500" />
                    <InfoRow icon={ClipboardCheck} label="Booking Status" value={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)} valueClass="text-emerald-500" />
                </div>

                <footer className="text-center">
                    <Link to="/host-dashboard" className="inline-block bg-stone-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-stone-600 transition-colors">
                        Close
                    </Link>
                </footer>
            </div>
        </div>
    </div>
  );
};

export default BookingSuccessPage;
