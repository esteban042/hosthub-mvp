import React, { useState, useEffect } from 'react';
import { Apartment, Host, Booking } from '../types';
import { BookingConfirmationCard } from '../components/BookingConfirmationCard';
import ApartmentHeader from '../components/ApartmentHeader';
import ApartmentStats from '../components/ApartmentStats';
import ApartmentInfo from '../components/ApartmentInfo';
import BookingSection from '../components/BookingSection';

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNewBooking = (booking: Booking) => {
    onNewBooking(booking);
    setConfirmedBooking(booking);
  }

  return (
    <div className="pt-24 md:pt-32 pb-24 w-full max-w-7xl mx-auto px-6 text-left animate-in fade-in duration-700 font-dm">
      <ApartmentHeader apartment={apartment} onBack={onBack} />
      <ApartmentStats apartment={apartment} />
      <ApartmentInfo apartment={apartment} />
      <BookingSection 
        apartment={apartment} 
        host={host} 
        airbnbCalendarDates={airbnbCalendarDates} 
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
