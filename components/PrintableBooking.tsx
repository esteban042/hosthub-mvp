import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { sanctumApi } from '../services/api.js';
import { Booking } from '../types.js';

const PrintableBooking: React.FC = () => {
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
    return <div className="min-h-screen bg-white text-black flex items-center justify-center">Error: {error}</div>;
  }

  if (!booking) {
    return <div className="min-h-screen bg-white text-black flex items-center justify-center">Loading...</div>;
  }
  
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const dailyBreakdown = Array.from({ length: nights }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return {
      date: date.toLocaleDateString(),
      price: booking.pricePerNight
    }
  });


  return (
    <div className="bg-white p-8 max-w-2xl mx-auto my-10 font-sans">
        <header className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800">Invoice</h1>
            <p className="text-gray-500">#{booking.customBookingId}</p>
        </header>

        <div className="flex justify-between mb-8">
            <div>
                <h2 className="text-xl font-semibold text-gray-700">Billed To</h2>
                <p className="text-gray-600">{booking.guestName}</p>
                <p className="text-gray-600">{booking.guestEmail}</p>
                {booking.guestPhone && <p className="text-gray-600">{booking.guestPhone}</p>}
            </div>
            <div>
                <h2 className="text-xl font-semibold text-gray-700 text-right">From</h2>
                <p className="text-gray-600 text-right">{booking.hostBusinessName}</p>
                <p className="text-gray-600 text-right">{booking.hostEmail}</p>
                <p className="text-gray-600 text-right">{booking.hostPhone}</p>
            </div>
        </div>

        <table className="w-full mb-8">
            <thead>
                <tr className="bg-gray-100">
                    <th className="text-left p-3">Date</th>
                    <th className="text-right p-3">Nightly Rate</th>
                </tr>
            </thead>
            <tbody>
              {
                dailyBreakdown.map(day => (
                  <tr key={day.date}>
                      <td className="p-3">{day.date}</td>
                      <td className="text-right p-3">${day.price.toLocaleString()}</td>
                  </tr>
                ))
              }
            </tbody>
        </table>

        <div className="flex justify-between items-center bg-gray-200 p-4 rounded-lg">
            <p className="text-xl font-bold text-gray-800">Total</p>
            <p className="text-xl font-bold text-green-600">${booking.totalPrice.toLocaleString()}</p>
        </div>

        {booking.depositAmount && booking.depositAmount > 0 && (
            <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg mt-4">
                <p className="text-lg font-semibold text-gray-700">Deposit Paid</p>
                <p className="text-lg font-semibold text-gray-700">-${booking.depositAmount.toLocaleString()}</p>
            </div>
        )}

        <div className="flex justify-between items-center bg-gray-300 p-4 rounded-lg mt-4">
            <p className="text-xl font-bold text-sky-700">Balance Due</p>
            <p className="text-xl font-bold text-cyan-600">${(booking.totalPrice - (booking.hostPayment || 0)).toLocaleString()}</p>
        </div>

        <footer className="text-center mt-10 text-gray-500">
            <p>Thank you for your for staying with us!</p>
        </footer>
    </div>
  );
};

export default PrintableBooking;
