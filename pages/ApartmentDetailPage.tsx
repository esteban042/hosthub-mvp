import React, { useState, useEffect } from 'react';
import { Apartment, Host, Booking, BlockedDate } from '../types';
import { hostHubApi } from '../services/api';
import { BookingConfirmationCard } from '../components/BookingConfirmationCard';
import ApartmentHeader from '../components/ApartmentHeader';
import ApartmentStats from '../components/ApartmentStats';
import ApartmentInfo from '../components/ApartmentInfo';
import BookingForm from '../components/BookingForm';

interface ApartmentDetailPageProps {
  apartment: Apartment;
  host: Host;
  airbnbCalendarDates: string[];
  onBack: () => void;
  onNewBooking: (booking: Booking) => void;
}

const ApartmentDetailPage: React.FC<ApartmentDetailPageProps> = ({
  apartment,
  host,
  airbnbCalendarDates,
  onBack,
  onNewBooking
}) => {
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchAvailability = async () => {
      try {
        const { bookings, blockedDates } = await hostHubApi.getApartmentAvailability(apartment.id);
        setBookings(bookings.map(b => ({ ...b, startDate: b.startDate.split('T')[0], endDate: b.endDate.split('T')[0] })));
        setBlockedDates(blockedDates.map(d => ({ ...d, date: d.date.split('T')[0] })));
      } catch (error) {
        console.error("Failed to fetch apartment availability:", error);
      }
    };
    fetchAvailability();
  }, [apartment.id]);

  const handleNewBooking = (booking: Booking) => {
    onNewBooking(booking);
    setConfirmedBooking(booking);
  }

  return (
    <div className="pt-24 md:pt-32 pb-24 w-full max-w-7xl mx-auto px-6 text-left animate-in fade-in duration-700 font-dm">
      <ApartmentHeader apartment={apartment} onBack={onBack} />
      <ApartmentStats apartment={apartment} />
      <ApartmentInfo apartment={apartment} />
      <BookingForm 
        apartment={apartment} 
        host={host}
        airbnbCalendarDates={airbnbCalendarDates} 
        bookings={bookings} 
        blockedDates={blockedDates}
        onNewBooking={handleNewBooking}
      />

      {confirmedBooking && (
        <BookingConfirmationCard
          booking={confirmedBooking}
          apartment={apartment}
          host={host}
          onClose={() => {
            setConfirmedBooking(null);
            onBack();
          }}
        />
      )}
    </div>
  );
};

export default ApartmentDetailPage;
