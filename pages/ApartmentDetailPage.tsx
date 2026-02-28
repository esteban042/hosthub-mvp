import React, { useState, useEffect } from 'react';
import { Apartment, Host, Booking, BlockedDate } from '../types.js';
import { BookingConfirmationCard } from '../components/booking/BookingConfirmationCard.js';
import ApartmentHeader from '../components/apartment/ApartmentHeader.js';
import ApartmentStats from '../components/apartment/ApartmentStats.js';
import ApartmentInfo from '../components/apartment/ApartmentInfo.js';
import CheckInInfo from '../components/apartment/CheckInInfo.js';
import BookingSection from '../components/booking/BookingSection.js';
import { sanctumApi } from '../services/api.js';
import { Clock, Home } from 'lucide-react';

interface ApartmentDetailPageProps {
  apartment: Apartment;
  host: Host;
  bookings: Booking[];
  blockedDates: BlockedDate[];
  airbnbCalendarDates: string[];
  onBack: () => void;
  onNewBooking: (booking: Booking) => void;
}

const ApartmentDetailPage: React.FC<ApartmentDetailPageProps> = ({
  apartment,
  host: initialHost,
  bookings,
  blockedDates,
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
    <div className="pt-24 md:pt-32 pb-24 w-full max-w-5xl mx-auto px-6 text-left animate-in fade-in duration-700 font-dm">
      <ApartmentHeader apartment={apartment} onBack={onBack} />
      <ApartmentStats apartment={apartment} />
      
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-x-16 gap-y-12">
        <div className="lg:col-span-2">
          <ApartmentInfo apartment={apartment} />
        </div>
        <div className="lg:col-span-1">
            {apartment.mapEmbedUrl && (
            <div className="w-full rounded-2xl border border-stone-200 overflow-hidden shadow-lg sticky top-32" style={{ height: '450px' }}>
                <iframe
                src={apartment.mapEmbedUrl}
                className="w-full h-full"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
            )}
        </div>
      </div>

      <div className="mt-24 max-w-lg mx-auto">
        <BookingSection 
            apartment={apartment} 
            host={host} 
            bookings={bookings}
            blockedDates={blockedDates}
            airbnbCalendarDates={airbnbCalendarDates} 
            onNewBooking={handleNewBooking} 
        />
      </div>

      <div className="mt-24 pt-12 border-t border-stone-200">
        <h3 className="text-2xl font-serif font-bold text-charcoal tracking-tight mb-6">Things to know</h3>
        <div className="p-8 rounded-2xl border border-stone-200 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-charcoal/80">
                <div className="flex items-start"><Clock className="w-5 h-5 mr-3 mt-1 text-sky-700 flex-shrink-0" /><span><b>Check-in:</b> {host.checkInTime}</span></div>
                <div className="flex items-start"><Clock className="w-5 h-5 mr-3 mt-1 text-sky-700 flex-shrink-0" /><span><b>Checkout:</b> {host.checkOutTime}</span></div>
            </div>
            <div className="mt-12">
              <CheckInInfo host={host} />
            </div>
        </div>
      </div>

      {confirmedBooking && (
        <BookingConfirmationCard
          booking={confirmedBooking}
          apartment={apartment}
          host={host}
          onClose={() => {
            setConfirmedBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default ApartmentDetailPage;
