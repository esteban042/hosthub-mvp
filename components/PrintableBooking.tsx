import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { sanctumApi } from '../services/api.js';
import { Booking } from '../types.js';
import { useTranslation } from 'react-i18next';

const PrintableBooking: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (bookingId) {
      const fetchData = async () => {
        try {
          const bookingData = await sanctumApi.getBookingById(bookingId);
          setBooking(bookingData);
        } catch (err: any) {
          setError(t('printable_booking.fetch_error') + err.message);
        }
      };

      fetchData();
    }
  }, [bookingId, t]);

  if (error) {
    return <div className="min-h-screen bg-white text-black flex items-center justify-center">{t('printable_booking.error')}: {error}</div>;
  }

  if (!booking) {
    return <div className="min-h-screen bg-white text-black flex items-center justify-center">{t('printable_booking.loading')}</div>;
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

  const currencySymbol = booking.hostCurrency?.symbol || '$';
  const serviceFee = (booking.platformFee || 0) + (booking.stripeFee || 0);

  return (
    <div className="bg-white p-8 max-w-2xl mx-auto my-10 font-sans">
        <header className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800">{t('printable_booking.invoice')}</h1>
            <p className="text-gray-500">#{booking.customBookingId}</p>
        </header>

        <div className="flex justify-between mb-8">
            <div>
                <h2 className="text-xl font-semibold text-gray-700">{t('printable_booking.billed_to')}</h2>
                <p className="text-gray-600">{booking.guestName}</p>
                <p className="text-gray-600">{booking.guestEmail}</p>
                {booking.guestPhone && <p className="text-gray-600">{booking.guestPhone}</p>}
            </div>
            <div>
                <h2 className="text-xl font-semibold text-gray-700 text-right">{t('printable_booking.from')}</h2>
                <p className="text-gray-600 text-right">{booking.hostBusinessName}</p>
                <p className="text-gray-600 text-right">{booking.hostPhysicalAddress}</p>               
                <p className="text-gray-600 text-right">{booking.hostEmail}</p>
                <p className="text-gray-600 text-right">{booking.hostPhone}</p>
            </div>
        </div>

        <table className="w-full mb-8">
            <thead>
                <tr className="bg-gray-100">
                    <th className="text-left p-3">{t('printable_booking.description')}</th>
                    <th className="text-right p-3">{t('printable_booking.amount')}</th>
                </tr>
            </thead>
            <tbody>
              {
                dailyBreakdown.map(day => (
                  <tr key={day.date}>
                      <td className="p-3">{t('printable_booking.nightly_stay', { date: day.date })}</td>
                      <td className="text-right p-3">{currencySymbol}{day.price.toLocaleString()}</td>
                  </tr>
                ))
              }
               {serviceFee > 0 && (
                <tr>
                  <td className="p-3">{t('printable_booking.service_fee')}</td>
                  <td className="text-right p-3">{currencySymbol}{serviceFee.toLocaleString()}</td>
                </tr>
              )}
            </tbody>
        </table>

        <div className="flex justify-between items-center bg-gray-200 p-4 rounded-lg">
            <p className="text-xl font-bold text-gray-800">{t('printable_booking.total')}</p>
            <p className="text-xl font-bold ">{currencySymbol}{booking.totalPrice.toLocaleString()}</p>
        </div>

        {booking.depositAmount && booking.depositAmount > 0 && (
            <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg mt-4">
                <p className="text-lg font-semibold text-gray-700">{t('printable_booking.deposit_paid')}</p>
                <p className="text-lg font-semibold text-gray-700">-{currencySymbol}{booking.depositAmount.toLocaleString()}</p>
            </div>
        )}

        <div className="flex justify-between items-center bg-gray-300 p-4 rounded-lg mt-4">
            <p className="text-xl font-bold text-sky-700">{t('printable_booking.balance_due')}</p>
            <p className="text-xl font-bold text-cyan-600">{currencySymbol}{(booking.totalPrice - (booking.depositAmount || 0)).toLocaleString()}</p>
        </div>

        <footer className="text-center mt-10 text-gray-500">
            <p>{t('printable_booking.thank_you')}</p>
        </footer>
    </div>
  );
};

export default PrintableBooking;
