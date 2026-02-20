import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { sanctumApi } from '../services/api';
import { Booking } from '../types';

const BookingCancelPage = () => {
  const location = useLocation();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bookingId = new URLSearchParams(location.search).get('booking_id');

    const fetchBooking = async () => {
      if (bookingId) {
        try {
          const fetchedBooking = await sanctumApi.getBookingById(bookingId);
          setBooking(fetchedBooking);
        } catch (error) {
          console.error("Failed to fetch booking:", error);
        }
      }
      setLoading(false);
    };

    fetchBooking();
  }, [location]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Booking Canceled</h1>
      <p className="text-lg text-gray-700 mb-8">Your booking was not completed. You can return to the apartment and try again.</p>
      {loading ? (
        <p>Loading apartment details...</p>
      ) : booking ? (
        <Link to={`/apartment/${booking.apartmentId}`} className="inline-block bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors">
          Return to Apartment
        </Link>
      ) : (
        <Link to="/" className="inline-block bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors">
          Return to Homepage
        </Link>
      )}
    </div>
  );
};

export default BookingCancelPage;
