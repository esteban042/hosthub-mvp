import React, { useState, useEffect } from 'react';
import { Apartment, Host, Booking } from '../types';
import { BookingConfirmationCard } from '../components/booking/BookingConfirmationCard';
import ApartmentHeader from '../components/apartment/ApartmentHeader';
import ApartmentStats from '../components/apartment/ApartmentStats';
import ApartmentInfo from '../components/apartment/ApartmentInfo';
import BookingSection from '../components/booking/BookingSection';
import { sanctumApi } from '../services/api';

interface ApartmentDetailPageProps {
  apartment: Apartment;
  host: Host;
  airbnbCalendarDates: string[];
  onBack: () => void;
  onNewBooking: (booking: Booking) => void;
}

const ApartmentDetailPage: React.FC<ApartmentDetailPageProps> = ({
  apartment,
  host: initialHost,
  airbnbCalendarDates,
  onBack,
  onNewBooking
}) => {
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [host, setHost] = useState<Host>(initialHost);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (apartment.id) {
      sanctumApi.trackApartmentView(apartment.id);
    }

    const fetchHostDetails = async () => {
      if (!initialHost?.slug) {
        return;
      }
      try {
        const landingData = await sanctumApi.getLandingData({ slug: initialHost.slug });
        if (landingData.host) {
          setHost(landingData.host);
        }
      } catch (error) {
        console.error("Failed to fetch full host details:", error);
      }
    };

    fetchHostDetails();
  }, [initialHost, apartment.id]);

  const handleNewBooking = (booking: Booking) => {
    onNewBooking(booking);
    setConfirmedBooking(booking);
  }

  return (
    <div className="pt-24 md:pt-32 pb-24 w-full max-w-4xl mx-auto px-6 text-left animate-in fade-in duration-700 font-dm">
      <ApartmentHeader apartment={apartment} onBack={onBack} />
      <ApartmentStats apartment={apartment} />
      <div className="mt-12">
        <ApartmentInfo apartment={apartment} host={host} />
        <div className='mt-12'>
        <BookingSection 
          apartment={apartment} 
          host={host} 
          airbnbCalendarDates={airbnbCalendarDates} 
          onNewBooking={handleNewBooking} 
        />
        </div>
      </div>

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
