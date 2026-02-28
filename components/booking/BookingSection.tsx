import React, { useState, useEffect } from 'react';
import { Apartment, Host, Booking, BlockedDate } from '../../types.js';
import { sanctumApi } from '../../services/api.js';
import BookingForm from './BookingForm.js';
import CheckInInfo from '../apartment/CheckInInfo.tsx';

interface BookingSectionProps {
  apartment: Apartment;
  host: Host;
  airbnbCalendarDates: string[];
  onNewBooking: (booking: Booking) => void;
}

const BookingSection: React.FC<BookingSectionProps> = ({ apartment, host, airbnbCalendarDates, onNewBooking }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const { bookings, blockedDates } = await sanctumApi.getApartmentAvailability(apartment.id);
        console.log("Fetched blocked dates:", blockedDates);
        setBookings(bookings.map(b => ({ ...b, startDate: b.startDate.split('T')[0], endDate: b.endDate.split('T')[0] })));
        setBlockedDates(blockedDates.map(d => ({ ...d, date: d.date.split('T')[0] })));
      } catch (error) {
        console.error("Failed to fetch apartment availability:", error);
      }
    };
    fetchAvailability();
  }, [apartment.id]);

  return (
    <div>
      <BookingForm 
        apartment={apartment} 
        host={host}
        airbnbCalendarDates={airbnbCalendarDates} 
        bookings={bookings} 
        blockedDates={blockedDates}
        onNewBooking={onNewBooking}
      />

    </div>
  );
};

export default BookingSection;
