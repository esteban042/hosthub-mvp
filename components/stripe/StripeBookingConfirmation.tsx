import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getBookingDetailsById } from '../../services/booking.service';
import { CheckCircle, Briefcase, Users, Hash, ArrowRight, DollarSign, Calendar, Home } from 'lucide-react';
import { BACKGROUND_COLOR, TEXT_COLOR, SKY_ACCENT, EMERALD_ACCENT } from '../../constants';
import { Booking, Apartment, Host } from '../../types';

const InfoRow: React.FC<{ icon: React.ElementType, label: string, value: string | number }> = ({ icon: Icon, label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-stone-200/60 last:border-none">
    <div className="flex items-center space-x-3 text-charcoal/80">
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </div>
    <span className="font-bold text-charcoal text-lg">{value}</span>
  </div>
);

const StripeBookingConfirmation = () => {
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get('session_id');

    if (sessionId) {
      // This is a placeholder. In a real app, you would have an endpoint
      // that takes a session_id and returns the booking details.
      // For now, we'll assume the backend has updated the booking and we can fetch it by ID.
      // This needs a backend change to get booking by session ID.
      const getBookingBySession = async (sessionId: string) => {
        // You would need to implement this service function and the corresponding backend endpoint
        console.log("Need to implement getBookingBySessionId");
        return null;
      }

      getBookingBySession(sessionId)
        .then(data => {
            if(data) setBooking(data)
        })
        .catch(err => {
          console.error("Error fetching booking details:", err);
          setError(err.message);
        });
    }
  }, [location]);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  if (error) {
    return <div className="text-red-500">Error loading booking details: {error}</div>;
  }

  if (!booking) {
    return <div>Loading booking confirmation...</div>;
  }

  return (
    <div style={{ backgroundColor: BACKGROUND_COLOR, color: TEXT_COLOR }} className="min-h-screen flex items-center justify-center p-4">
      <div className="border border-stone-200 rounded-2xl shadow-2xl max-w-2xl w-full font-sans bg-white/80 backdrop-blur-lg">
        <div className="p-8 space-y-8">
          <header className="text-center space-y-3">
            <CheckCircle size={50} className="mx-auto text-emerald-accent bg-emerald-accent/10 p-2 rounded-full" />
            <h1 className="text-4xl font-bold tracking-tight">Booking confirmed!</h1>
            <p className="text-charcoal/70 text-lg">Your booking was successful and a confirmation has been sent to your email.</p>
          </header>

          <div className="bg-white/50 p-6 rounded-xl border border-stone-200/60">
            <InfoRow icon={Hash} label="Booking ID" value={booking.customBookingId || 'N/A'} />
            <InfoRow icon={Home} label="Apartment" value={booking.apartment_title} />
            <InfoRow icon={Briefcase} label="Host" value={booking.host_name} />
            <div className="flex justify-between items-center py-4 border-b border-stone-200/60">
              <div className="flex items-center space-x-3 text-charcoal/80">
                <Calendar size={18} />
                <span className="font-medium">Dates</span>
              </div>
              <div className="flex items-center space-x-2 font-bold text-charcoal text-lg">
                <span>{formatDate(booking.startDate)}</span>
                <ArrowRight size={20} className="text-sky-accent"/>
                <span>{formatDate(booking.endDate)}</span>
              </div>
            </div>
            <InfoRow icon={Users} label="Number of Guests" value={booking.numGuests} />
            <InfoRow icon={DollarSign} label="Total Price" value={`$${booking.totalPrice.toFixed(2)}`} />
          </div>

          <footer className="text-center">
            <Link to="/" style={{ backgroundColor: SKY_ACCENT }} className="hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 w-full md:w-auto inline-block">
              Back to Homepage
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default StripeBookingConfirmation;
