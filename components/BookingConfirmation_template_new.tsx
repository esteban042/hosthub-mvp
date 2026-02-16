import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { sanctumApi } from '../services/api';
import { Booking } from '../types';
import { formatBookingRange } from '../utils/formatBookingRange';

const BookingConfirmation = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      const fetchData = async () => {
        try {
          const bookingData = await sanctumApi.getBookingById(bookingId);
          setBooking(bookingData);
        } catch (err: any) {
          setError('Failed to fetch data: ' + err.message);
        }
      };

      fetchData();
    }
  }, [bookingId]);

  if (error) {
    return <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center">Error: {error}</div>;
  }

  if (!booking) {
    return <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto my-10 font-sans">
        <header className="flex justify-between items-start mb-10 pb-4 border-b">
            <div>
                <h1 className="text-4xl font-bold text-gray-800">Booking Confirmation</h1>
                <p className="text-gray-500">#{booking.customBookingId}</p>
            </div>
            <div>
                <p className="text-lg font-semibold text-gray-700">{booking.hostName}</p>
                <p className="text-gray-500">{booking.hostEmail}</p>
                <p className="text-gray-500">{booking.hostPhone}</p>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Apartment Details</h2>
                <p className="text-lg font-bold text-gray-800">{booking.apartmentTitle}</p>
                <p className="text-gray-600">{booking.apartmentCity}</p>
            </div>
            <div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Guest Information</h2>
                <p className="text-lg font-bold text-gray-800">{booking.guestName}</p>
                <p className="text-gray-600">{booking.guestEmail}</p>
                {booking.guestPhone && <p className="text-gray-600">{booking.guestPhone}</p>}
            </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-10">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Booking Summary</h2>
            <div className="flex justify-between items-center py-3 border-b">
                <p className="text-gray-600">Check-in / Check-out</p>
                <p className="font-semibold text-gray-800">{formatBookingRange(booking.startDate, booking.endDate)}</p>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
                <p className="text-gray-600">Number of Guests</p>
                <p className="font-semibold text-gray-800">{booking.numGuests}</p>
            </div>
            <div className="flex justify-between items-center pt-3">
                <p className="text-xl font-bold text-gray-800">Total Price</p>
                <p className="text-xl font-bold text-green-600">${booking.totalPrice.toLocaleString()}</p>
            </div>
        </div>

        {booking.apartmentPhotos && booking.apartmentPhotos.length > 0 && (
            <div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Apartment Photo</h2>
                <img src={booking.apartmentPhotos[0]} alt={booking.apartmentTitle} className="rounded-lg shadow-md w-full" />
            </div>
        )}

    </div>
  );
};

export default BookingConfirmation;
