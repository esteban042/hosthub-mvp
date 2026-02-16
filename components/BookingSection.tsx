import React, { useState, useEffect } from 'react';
import { Apartment, Host, Booking, BlockedDate } from '../types';
import { sanctumApi } from '../services/api';
import BookingForm from './BookingForm';
import CheckInInfo from './CheckInInfo';
import Faq from './Faq';

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
      <div className="mt-12">
        <CheckInInfo host={host} />
      </div>
      <div className="mt-12">
        <Faq faq={host.faq} />
      </div>
    </div>
  );
};

export default BookingSection;
