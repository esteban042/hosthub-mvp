import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { sanctumApi } from '../services/api';
import { Booking } from '../types';

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
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-emerald-600 mb-4">Booking Confirmed!</h1>
      <p className="text-lg text-gray-700 mb-2">Thank you for your payment, {booking.guestName}.</p>
      <p className="text-gray-600 mb-4">Your booking is now confirmed. A confirmation email has been sent to {booking.guestEmail}.</p>
      <div className="bg-gray-100 rounded-lg p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Booking Summary</h2>
        <p><strong>Booking ID:</strong> {booking.customBookingId}</p>
        <p><strong>Apartment:</strong> {booking.apartment?.title}</p>
        <p><strong>Dates:</strong> {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
        <p><strong>Total Price:</strong> ${booking.totalPrice.toLocaleString()}</p>
      </div>
      <Link to={`/booking/${booking.id}`} className="inline-block mt-8 bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors">
        View Full Booking Details
      </Link>
    </div>
  );
};

export default BookingSuccessPage;
