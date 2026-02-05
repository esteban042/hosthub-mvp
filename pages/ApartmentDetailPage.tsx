import React, { useState, useEffect, useMemo } from 'react';
import { Apartment, Host, Booking, BlockedDate, BookingStatus } from '../types';
import { AMENITY_ICONS, CORE_ICONS, AMENITY_GREEN, CARD_BG, CARD_BORDER, HeroCalendar, formatDate } from './GuestLandingPage';

interface ApartmentDetailPageProps {
  apartment: Apartment;
  host: Host;
  bookings: Booking[];
  blockedDates: BlockedDate[];
  onBack: () => void;
  onNewBooking: (booking: Booking) => void;
}

const LABEL_COLOR = 'rgb(168, 162, 158)';

const ApartmentDetailPage: React.FC<ApartmentDetailPageProps> = ({
  apartment,
  host,
  bookings,
  blockedDates,
  onBack,
  onNewBooking
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [numGuests, setNumGuests] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const totalPrice = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    let total = 0;
    let current = new Date(start);
    while (current < end) {
      const dateStr = current.toISOString().split('T')[0];
      const override = apartment.priceOverrides?.find(rule => dateStr >= rule.startDate && dateStr <= rule.endDate);
      total += override ? override.price : apartment.pricePerNight;
      current.setDate(current.getDate() + 1);
    }
    return total;
  }, [startDate, endDate, apartment]);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !startDate || !endDate || !name) return;
    
    onNewBooking({
      id: `book-${Date.now()}`,
      apartmentId: apartment.id,
      guestEmail: email,
      numGuests: numGuests,
      startDate: startDate,
      endDate: endDate,
      status: BookingStatus.REQUESTED,
      totalPrice: totalPrice, 
      isDepositPaid: false
    });
    setSuccess(true);
  };

  const nextPhoto = () => setCurrentPhotoIdx((prev) => (prev + 1) % apartment.photos.length);
  const prevPhoto = () => setCurrentPhotoIdx((prev) => (prev - 1 + apartment.photos.length) % apartment.photos.length);

  const toSentenceCase = (str: string) => {
    if (!str) return '';
    const lower = str.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  if (success) {
    return (
      <div className="pt-32 pb-24 max-w-2xl px-6 text-left font-dm animate-in zoom-in duration-500">
        <h2 className="text-4xl font-serif font-bold text-white mb-4">Stay requested</h2>
        <p className="text-lg mb-12" style={{ color: LABEL_COLOR }}>{host.name} will review your request for "{apartment.title}" shortly.</p>
        <button onClick={onBack} className="bg-coral-500 hover:bg-coral-600 text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all">Back to collection</button>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-24 w-full max-w-7xl mx-auto px-6 text-left animate-in fade-in duration-700 font-dm">
      <button onClick={onBack} className="flex items-center space-x-2 text-stone-300 hover:text-white transition-colors mb-10 group">
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Return to gallery</span>
      </button>

      {/* Hero Header */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-16">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 rounded-3xl border border-stone-800" style={{ backgroundColor: CARD_BG }}>
             <div className="flex items-center space-x-5">
                <div className="w-12 h-12 bg-stone-900/60 rounded-xl flex items-center justify-center text-stone-500 flex-shrink-0 border border-stone-800/40">
                   {CORE_ICONS.Bed("w-6 h-6")}
                </div>
                <div className="flex flex-col">
                   <p className="text-sm font-medium leading-none mb-2" style={{ color: LABEL_COLOR }}>Bedrooms</p>
                   <p className="text-white text-3xl font-medium leading-none">{apartment.bedrooms}</p>
                </div>
             </div>
             <div className="flex items-center space-x-5">
                <div className="w-12 h-12 bg-stone-900/60 rounded-xl flex items-center justify-center text-stone-500 flex-shrink-0 border border-stone-800/40">
                   {CORE_ICONS.Bath("w-6 h-6")}
                </div>
                <div className="flex flex-col">
                   <p className="text-sm font-medium leading-none mb-2" style={{ color: LABEL_COLOR }}>Bathrooms</p>
                   <p className="text-white text-3xl font-medium leading-none">{apartment.bathrooms}</p>
                </div>
             </div>
             <div className="flex items-center space-x-5">
                <div className="w-12 h-12 bg-stone-900/60 rounded-xl flex items-center justify-center text-stone-500 flex-shrink-0 border border-stone-800/40">
                   {CORE_ICONS.Guests("w-6 h-6")}
                </div>
                <div className="flex flex-col">
                   <p className="text-sm font-medium leading-none mb-2" style={{ color: LABEL_COLOR }}>Max guests</p>
                   <p className="text-white text-3xl font-medium leading-none">{apartment.capacity}</p>
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <h3 className="text-2xl font-serif font-bold text-white tracking-tight">About this place</h3>
             <p className="text-lg leading-relaxed font-medium text-stone-400 max-w-2xl">
               {apartment.description}
             </p>
          </div>

          <div className="space-y-8">
             <h3 className="text-2xl font-serif font-bold text-white tracking-tight">Amenities</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* Dynamic Booking Sidebar */}
        <div className="lg:col-span-1">
           <div className="sticky top-32 bg-stone-900/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-stone-800 shadow-2xl">
              <div className="flex items-baseline justify-between mb-10 pb-10 border-b border-stone-800/40">
                 <div>
                    <span className="text-[10px] font-medium uppercase tracking-[0.2em] block mb-2" style={{ color: LABEL_COLOR }}>Estimated total</span>
                    <span className="text-5xl font-black text-white">${totalPrice > 0 ? totalPrice.toLocaleString() : apartment.pricePerNight.toLocaleString()}</span>
                 </div>
                 <div className="text-right">
                    <span className="text-[10px] font-medium uppercase tracking-[0.2em] block mb-2" style={{ color: LABEL_COLOR }}>Base rate</span>
                    <span className="text-xl font-bold text-stone-400">${apartment.pricePerNight}<span className="text-[10px] font-medium ml-1">/nt</span></span>
                 </div>
              </div>

              <form onSubmit={handleBooking} className="space-y-6">
                 <div className="space-y-2">
                    <label className="block text-sm font-medium ml-1" style={{ color: LABEL_COLOR }}>Guest name</label>
                    <input 
                      type="text" required placeholder="Enter full name" value={name} onChange={e => setName(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-2xl py-5 px-6 text-sm font-medium text-white focus:ring-1 focus:ring-coral-500 transition-all outline-none placeholder:text-stone-700" 
                    />
                 </div>
                 
                 <div className="space-y-2 relative">
                    <label className="block text-sm font-medium ml-1" style={{ color: LABEL_COLOR }}>Select dates</label>
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
                             {startDate ? `${formatDate(startDate)} — ${formatDate(endDate) || '...'}` : 'Add stay dates'}
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
                        />
                      </div>
                    )}
                 </div>

                 <div className="space-y-2">
                    <label className="block text-sm font-medium ml-1" style={{ color: LABEL_COLOR }}>Number of guests</label>
                    <select 
                      value={numGuests} onChange={e => setNumGuests(parseInt(e.target.value))} 
                      className="w-full bg-stone-950 border border-stone-800 rounded-2xl py-5 px-6 text-sm font-medium text-white focus:ring-1 focus:ring-coral-500 outline-none appearance-none cursor-pointer"
                    >
                       {[...Array(apartment.capacity)].map((_, i) => (
                         <option key={i+1} value={i+1} className="bg-stone-950">{i+1} guest{i > 0 ? 's' : ''}</option>
                       ))}
                    </select>
                 </div>

                 <div className="space-y-2">
                   <label className="block text-sm font-medium ml-1" style={{ color: LABEL_COLOR }}>Contact email</label>
                   <input 
                     type="email" required placeholder="contact@domain.com" value={email} onChange={e => setEmail(e.target.value)}
                     className="w-full bg-stone-950 border border-stone-800 rounded-2xl py-5 px-6 text-sm font-medium text-white focus:ring-1 focus:ring-coral-500 outline-none placeholder:text-stone-700"
                   />
                 </div>

                 <button 
                   disabled={!startDate || !endDate}
                   className="w-full bg-coral-500 hover:bg-coral-600 disabled:bg-stone-800 disabled:text-stone-600 disabled:cursor-not-allowed text-white font-black py-7 rounded-full transition-all text-[12px] tracking-[0.3em] uppercase mt-8 shadow-2xl shadow-coral-500/30 active:scale-[0.98]"
                 >
                   Request reservation
                 </button>
                 <p className="text-[10px] text-center font-medium uppercase tracking-widest mt-6" style={{ color: LABEL_COLOR }}>Approval usually within 24 hours</p>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentDetailPage;