import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { sanctumApi } from '../services/api.js';
import { Booking } from '../types.js';
import { formatBookingRange } from '../utils/formatBookingRange.js';

const BookingConfirmation = () => {
  const { t } = useTranslation();
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
          setError(t('printable_booking.fetch_error') + err.message);
        }
      };

      fetchData();
    }
  }, [bookingId, t]);

  if (error) {
    return <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center">{t('printable_booking.error')}: {error}</div>;
  }

  if (!booking) {
    return <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center">{t('printable_booking.loading')}</div>;
  }

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto my-10 font-sans">
        <header className="flex justify-between items-start mb-10 pb-4 border-b">
            <div>
                <h1 className="text-4xl font-bold text-gray-800">{t('booking_confirmation.title')}</h1>
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
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">{t('apartment.apartment_card.title')}</h2>
                <p className="text-lg font-bold text-gray-800">{booking.apartmentTitle}</p>
                <p className="text-gray-600">{booking.apartmentCity}</p>
            </div>
            <div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">{t('booking_list_item.guest_info')}</h2>
                <p className="text-lg font-bold text-gray-800">{booking.guestName}</p>
                <p className="text-gray-600">{booking.guestEmail}</p>
                {booking.guestPhone && <p className="text-gray-600">{booking.guestPhone}</p>}
            </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-10">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">{t('booking_confirmation.booking_summary')}</h2>
            <div className="flex justify-between items-center py-3 border-b">
                <p className="text-gray-600">{t('apartment_detail_page.check_in_out')}</p>
                <p className="font-semibold text-gray-800">{formatBookingRange(booking.startDate, booking.endDate)}</p>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
                <p className="text-gray-600">{t('booking_confirmation.num_guests')}</p>
                <p className="font-semibold text-gray-800">{booking.numGuests}</p>
            </div>
            <div className="flex justify-between items-center pt-3">
                <p className="text-xl font-bold text-gray-800">{t('booking_confirmation.total_price')}</p>
                <p className="text-xl font-bold text-green-600">${booking.totalPrice.toLocaleString()}</p>
            </div>
        </div>

        {booking.apartmentPhotos && booking.apartmentPhotos.length > 0 && (
            <div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">{t('apartment.apartment_card.photo')}</h2>
                <img src={booking.apartmentPhotos[0]} alt={booking.apartmentTitle} className="rounded-lg shadow-md w-full" />
            </div>
        )}

    </div>
  );
};

export default BookingConfirmation;
