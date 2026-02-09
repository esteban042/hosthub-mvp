
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Apartment, Host, Booking, BlockedDate, BookingStatus } from '../types';
import { AMENITY_ICONS, CORE_ICONS, AMENITY_GREEN, CARD_BG, HeroCalendar } from './GuestLandingPage';
import { formatDate } from '../utils/dates';
import { hostHubApi } from '../services/api';
import { BookingConfirmationCard } from '../components/BookingConfirmationCard';

interface ApartmentDetailPageProps {
  apartment: Apartment;
  host: Host;
  bookings: Booking[];
  blockedDates: BlockedDate[];
  airbnbCalendarDates: string[];
  onBack: () => void;
  onNewBooking: (booking: Booking) => void;
}

const LABEL_COLOR = 'rgb(214,213,213)';

const countries = [ 'USA', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Australia', 'Japan', 'China', 'Brazil', 'India' ];

const ApartmentDetailPage: React.FC<ApartmentDetailPageProps> = ({
  apartment,
  host,
  bookings,
  blockedDates,
  airbnbCalendarDates,
  onBack,
  onNewBooking
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [guestCountry, setGuestCountry] = useState('');
  const [numGuests, setNumGuests] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [isMapEnlarged, setIsMapEnlarged] = useState(false);

  const aboutColRef = useRef<HTMLDivElement>(null);
  const [mapContainerHeight, setMapContainerHeight] = useState<number>(400);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const updateMapHeight = () => {
      if (aboutColRef.current && window.innerWidth >= 1024) {
        setMapContainerHeight(Math.max(400, aboutColRef.current.clientHeight));
      } else {
        setMapContainerHeight(300);
      }
    };

    updateMapHeight();
    window.addEventListener('resize', updateMapHeight);
    return () => window.removeEventListener('resize', updateMapHeight);
  }, [apartment, aboutColRef]);

  const totalPrice = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    let total = 0;
    let current = new Date(start);
    while (current.toISOString().split('T')[0] < end.toISOString().split('T')[0]) {
      const dateStr = current.toISOString().split('T')[0];
      const override = apartment.priceOverrides?.find(rule => dateStr >= rule.startDate && dateStr <= rule.endDate);
      total += override ? override.price : (apartment.pricePerNight || 0);
      current.setDate(current.getDate() + 1);
    }
    return total;
  }, [startDate, endDate, apartment]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !startDate || !endDate || !name) return;

    const bookingDetails: Partial<Booking> = {
      apartmentId: apartment.id,
      guestName: name,
      guestEmail: email,
      guestCountry: guestCountry,
      guestPhone: phone,
      numGuests: numGuests,
      startDate: startDate,
      endDate: endDate,
      status: BookingStatus.CONFIRMED,
      totalPrice: totalPrice,
      isDepositPaid: false,
      guestMessage: message
    };

    try {
      const newConfirmedBooking = await hostHubApi.createBooking(bookingDetails);

      await hostHubApi.sendEmail(
        email,
        `Your Booking for ${apartment.title} is Confirmed!`,
        'BookingConfirmation',
        newConfirmedBooking,
        apartment,
        host
      );

      onNewBooking(newConfirmedBooking);
      setConfirmedBooking(newConfirmedBooking);

    } catch (error) {
      console.error("Failed to create booking:", error);
      // Here you could set an error state and display a message to the user
    }
  };


  const nextPhoto = () => setCurrentPhotoIdx((prev) => (prev + 1) % apartment.photos.length);
  const prevPhoto = () => setCurrentPhotoIdx((prev) => (prev - 1 + apartment.photos.length) % apartment.photos.length);

  const toSentenceCase = (str: string) => {
    if (!str) return '';
    const lower = str.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  return (
    <div className="pt-24 md:pt-32 pb-24 w-full max-w-7xl mx-auto px-6 text-left animate-in fade-in duration-700 font-dm">
      <button onClick={onBack} className="flex items-center space-x-2 text-stone-300 hover:text-white transition-colors mb-10 group">
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Return</span>
      </button>

      {/* Hero Image Section */}
      <div className="relative w-full h-[60vh] rounded-3xl overflow-hidden mb-12 shadow-2xl border border-stone-800">
         <img src={apartment.photos[currentPhotoIdx]} className="w-full h-full object-cover transition-opacity duration-1000" alt={apartment.title} />
         <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />

         {apartment.photos.length > 1 && (
           <>
             <button onClick={prevPhoto} className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-all border border-white/5 z-10">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7"/></svg>
             </button>
             <button onClick={nextPhoto} className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-all border border-white/5 z-10">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7"/></svg>
             </button>
           </>
         )}

         <div className="absolute bottom-8 left-10 right-10">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-2 tracking-tight drop-shadow-2xl">{apartment.title}</h1>
            <div className="flex items-center space-x-2 text-white/80">
               <div className="text-emerald-400">{CORE_ICONS.Location("w-5 h-5")}</div>
               <span className="text-base font-medium tracking-wide">{apartment.city}</span>
            </div>
         </div>
      </div>

      {/* Property Statistics Row */}
      <div className="flex items-center space-x-12 py-8 border-y border-stone-800/40 mb-16 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-stone-900/60 rounded-2xl flex items-center justify-center border border-stone-800/40 text-emerald-400">
              {CORE_ICONS.Bed("w-6 h-6")}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Beds</span>
              <span className="text-2xl font-black text-white leading-none mt-1">{apartment.bedrooms}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-stone-900/60 rounded-2xl flex items-center justify-center border border-stone-800/40 text-emerald-400">
              {CORE_ICONS.Bath("w-6 h-6")}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Baths</span>
              <span className="text-2xl font-black text-white leading-none mt-1">{apartment.bathrooms}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-stone-900/60 rounded-2xl flex items-center justify-center border border-stone-800/40 text-emerald-400">
              {CORE_ICONS.Guests("w-6 h-6")}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Guests</span>
              <span className="text-2xl font-black text-white leading-none mt-1">{apartment.capacity}</span>
            </div>
          </div>
      </div>

      {/* Main Content Grid: Description (2/3) and Map (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-20 items-start">
        <div ref={aboutColRef} className="lg:col-span-2 space-y-12">
          <div className="space-y-6">
             <h3 className="text-3xl font-serif font-bold text-white tracking-tight">About this place</h3>
             <p className="text-xl leading-relaxed font-medium text-stone-400">
               {apartment.description}
             </p>
          </div>

          <div className="space-y-8">
             <h3 className="text-2xl font-serif font-bold text-white tracking-tight">Amenities</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {apartment.amenities.map(amenity => (
                  <div
                    key={amenity}
                    className="flex items-center space-x-5 p-4 rounded-2xl border border-stone-800 transition-all hover:bg-stone-800/20 active:scale-95 group"
                    style={{ backgroundColor: CARD_BG }}
                  >
                    <div className="w-7 h-7 flex-shrink-0 group-hover:scale-110 transition-transform" style={{ color: AMENITY_GREEN }}>
                      {AMENITY_ICONS[amenity] ? AMENITY_ICONS[amenity]("w-full h-full") : AMENITY_ICONS['Default']!("w-full h-full")}
                    </div>
                    <span className="text-lg font-medium tracking-tight" style={{ color: LABEL_COLOR }}>
                      {toSentenceCase(amenity)}
                    </span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {apartment.mapEmbedUrl ? (
              <div
                className="relative w-full overflow-hidden rounded-[2.5rem] border border-stone-800 shadow-xl cursor-pointer"
                style={{ height: mapContainerHeight }}
                onClick={() => setIsMapEnlarged(true)}
              >
                <iframe
                  src={apartment.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Apartment Location"
                ></iframe>
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300 text-white font-bold text-lg">
                  <span className="px-6 py-3 bg-stone-900/80 rounded-2xl backdrop-blur-md border border-stone-700 text-xs uppercase tracking-widest">Enlarge Map</span>
                </div>
              </div>
          ) : (
             <div className="bg-stone-900/30 rounded-[2.5rem] border border-stone-800 h-64 flex items-center justify-center text-stone-600 italic">
               Location map not available
             </div>
          )}
        </div>
      </div>

      {/* Booking Form Card */}
      <div className="bg-stone-900/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-stone-800 shadow-2xl max-w-3xl mx-auto">
          <div className="flex items-baseline justify-between mb-10 pb-10 border-b border-stone-800/40">
             <div>
                <span className="text-[10px] font-medium text[rgb(214,213,213)] uppercase tracking-[0.2em] block mb-2" style={{ color: LABEL_COLOR }}>Estimated total</span>
                <span className="text-5xl font-black text-white">${totalPrice > 0 ? totalPrice.toLocaleString() : (apartment.pricePerNight || 0).toLocaleString()}</span>
             </div>
             <div className="text-right">
             </div>
          </div>

          <form onSubmit={handleBooking} className="space-y-6">
             <div className="space-y-2">
                <label className="block text-sm text[rgb(214,213,213)] font-medium ml-1" style={{ color: LABEL_COLOR }}>Guest name</label>
                <input
                  type="text" required placeholder="Enter full name" value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-2xl py-5 px-6 text-sm font-medium text-white focus:ring-1 focus:ring-coral-500 transition-all outline-none placeholder:text-stone-700"
                />
             </div>

             <div className="space-y-2 relative">
                <label className="block text-sm font-medium ml-1" style={{ color: LABEL_COLOR }}>Stay availability</label>
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className={`w-full bg-stone-950 border rounded-2xl py-5 px-6 text-sm font-medium transition-all flex items-center justify-between group ${isCalendarOpen ? 'border-coral-500' : 'border-stone-800'}`}
                >
                   <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCalendarOpen ? 'bg-coral-500 text-white' : 'bg-stone-800 text-emerald-400'}`}>
                         {CORE_ICONS.Calendar("w-4 h-4")}
                      </div>
                      <span className={startDate ? 'text-white' : 'text-stone-500'}>
                         {startDate ? `${formatDate(startDate)} — ${formatDate(endDate) || '...'}` : 'Check dates & rates'}
                      </span>
                   </div>
                </button>

                {isCalendarOpen && (
                  <div className="absolute top-full left-0 right-0 z-[100] mt-4">
                    <HeroCalendar
                      apartment={apartment}
                      startDate={startDate}
                      endDate={endDate}
                      onSelect={(s, e) => {
                        setStartDate(s);
                        setEndDate(e);
                        if (s && e) setIsCalendarOpen(false);
                      }}
                      allBookings={bookings}
                      allBlockedDates={blockedDates}
                      airbnbBlockedDates={airbnbCalendarDates}
                    />
                  </div>
                )}
             </div>

             <div className="space-y-2">
                <label className="block text-m text[rgb(214,213,213)] font-medium ml-1" style={{ color: LABEL_COLOR }}>Number of guests</label>
                <div className="flex items-center justify-between p-4 bg-stone-900 border border-stone-800 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => setNumGuests(prev => Math.max(1, prev - 1))}
                        className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center text-white hover:border-coral-500 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M20 12H4" /></svg>
                    </button>
                    <span className="text-xl font-black text-white">{numGuests}</span>
                    <button
                        type="button"
                        onClick={() => setNumGuests(prev => Math.min(apartment.capacity || 10, prev + 1))}
                        className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center text-white hover:border-coral-500 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 4v16m8-8H4" /></svg>
                    </button>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="block text-sm font-medium ml-1" style={{ color: LABEL_COLOR }}>Contact email</label>
                 <input
                   type="email" required placeholder="contact@domain.com" value={email} onChange={e => setEmail(e.target.value)}
                   className="w-full bg-stone-950 border border-stone-800 rounded-2xl py-5 px-6 text-sm font-medium text-white focus:ring-1 focus:ring-coral-500 outline-none placeholder:text-stone-700"
                 />
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-medium ml-1" style={{ color: LABEL_COLOR }}>Country</label>
                 <select
                   required value={guestCountry} onChange={e => setGuestCountry(e.target.value)}
                   className="w-full bg-stone-950 border border-stone-800 rounded-2xl py-5 px-6 text-sm font-medium text-white focus:ring-1 focus:ring-coral-500 outline-none placeholder:text-stone-700"
                 >
                   <option value="">Select a country</option>
                   {countries.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-medium ml-1" style={{ color: LABEL_COLOR }}>Contact phone (optional)</label>
                 <input
                   type="tel" placeholder="e.g., +1 555 123 4567" value={phone} onChange={e => setPhone(e.target.value)}
                   className="w-full bg-stone-950 border border-stone-800 rounded-2xl py-5 px-6 text-sm font-medium text-white focus:ring-1 focus:ring-coral-500 outline-none placeholder:text-stone-700"
                 />
               </div>
             </div>

             <div className="space-y-2">
                <label className="block text-sm font-medium ml-1" style={{ color: LABEL_COLOR }}>Your message to the host (optional)</label>
                <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl py-5 px-6 text-sm font-medium text-white focus:ring-1 focus:ring-coral-500 outline-none placeholder:text-stone-700 h-[100px] resize-y"
                    placeholder="Any special requests or questions?"
                ></textarea>
             </div>

             <button
               disabled={!name || !email || !startDate || !endDate}
               className="w-full bg-coral-500 hover:bg-coral-600 disabled:bg-stone-800 disabled:text-stone-600 disabled:cursor-not-allowed text-white font-black py-7 rounded-full transition-all text-[12px] tracking-[0.3em] uppercase mt-8 shadow-2xl shadow-coral-500/30 active:scale-[0.98]"
             >
               Book now
             </button>
             <p className="text-[10px] text-center font-medium uppercase tracking-widest mt-6" style={{ color: LABEL_COLOR }}>Approval usually within 24 hours</p>
          </form>
       </div>

      {isMapEnlarged && apartment.mapEmbedUrl && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={() => setIsMapEnlarged(false)}
        >
           <button
             onClick={() => setIsMapEnlarged(false)}
             className="absolute top-8 right-8 text-stone-300 hover:text-white transition-colors z-[210]"
           >
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
           <div
             className="relative w-full h-full max-w-6xl max-h-[80vh] rounded-[3rem] overflow-hidden border border-stone-700 shadow-2xl"
             onClick={e => e.stopPropagation()}
           >
              <iframe
                src={apartment.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Enlarged Sanctuary Location"
              ></iframe>
           </div>
        </div>
      )}

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
