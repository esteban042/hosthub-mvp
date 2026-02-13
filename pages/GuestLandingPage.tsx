
import React, { useState, useEffect, useMemo } from 'react';
import { Host, Apartment, Booking, BlockedDate } from '../types';
import { formatDate } from '../utils/dates';
import { CORE_ICONS } from '../constants';
import HeroCalendar from '../components/HeroCalendar';
import GuestPopover from '../components/GuestPopover';
import FeaturedStays from '../components/FeaturedStays';
import PremiumLandingExtension from '../components/PremiumLandingExtension';
import Modal from '../components/Modal';

interface GuestLandingPageProps {
  host: Host;
  apartments: Apartment[];
  bookings: Booking[];
  blockedDates: BlockedDate[]; 
  airbnbCalendarDates: string[];
  onNewBooking: (booking: Booking) => void;
  onSelectApartment: (id: string) => void;
}

export const GuestLandingPage: React.FC<GuestLandingPageProps> = ({ 
  host, apartments, onSelectApartment, bookings, blockedDates, airbnbCalendarDates, onNewBooking 
}) => {
  const [isDatesOpen, setIsDatesOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [dates, setDates] = useState({ start: '', end: '' });
  const [numGuests, setNumGuests] = useState(1);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isConditionsModalOpen, setIsConditionsModalOpen] = useState(false);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);

  const hostApartments = useMemo(() => 
    apartments.filter(apt => apt.hostId === host.id), [apartments, host.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.calendar-container') && !target.closest('.guests-container')) {
        setIsDatesOpen(false);
        setIsGuestsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative h-[100vh] flex flex-col items-center justify-center text-center px-6 hero-gradient">
        <div className="z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <p className="text-[12px] font-black uppercase tracking-[0.6em] text-emerald-400 mb-6">Welcome to Sanctum</p>
          <h1 className="text-6xl md:text-9xl font-serif font-bold text-white leading-tight tracking-tight">
            Your Perfect Escape <br/>
            <span className="text-coral-500 italic">Awaits</span>
          </h1>
          <p className="mt-8 text-xl md:text-2xl text-stone-400 max-w-3xl mx-auto font-medium leading-relaxed">
            Discover handpicked apartments and villas for your next unforgettable getaway. Where comfort meets hospitality.
          </p>

          <div className="mt-16 w-full max-w-5xl mx-auto">
             <div className="bg-stone-900/60 backdrop-blur-2xl border border-stone-800 rounded-[2.5rem] p-3 flex flex-col md:flex-row items-center gap-1 shadow-2xl relative z-[60]">
                
                <div 
                  onClick={() => { setIsDatesOpen(!isDatesOpen); setIsGuestsOpen(false); }}
                  className="flex-1 flex items-center px-10 py-5 hover:bg-white/5 rounded-[1.8rem] transition-colors cursor-pointer text-left w-full border-b md:border-b-0 md:border-r border-stone-800/50 group calendar-container"
                >
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-5 transition-colors ${isDatesOpen ? 'bg-coral-500 text-white' : 'bg-stone-800 text-emerald-400'}`}>
                      {CORE_ICONS.Calendar("w-5 h-5")}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-xs font-medium text-stone-500 mb-1">Check in — Check out</span>
                      <span className="text-white font-medium text-lg leading-none">
                        {dates.start ? `${formatDate(dates.start)} — ${formatDate(dates.end) || '...'}` : 'Select dates'}
                      </span>
                   </div>
                </div>

                {isDatesOpen && (
                  <div className="absolute top-full left-0 mt-4 z-[100] calendar-container">
                    <HeroCalendar 
                      startDate={dates.start} endDate={dates.end} 
                      onSelect={(s, e) => {
                        setDates({ start: s, end: e });
                        if (s && e) setIsDatesOpen(false);
                      }} 
                      allBookings={bookings}
                      allBlockedDates={blockedDates}
                      airbnbBlockedDates={airbnbCalendarDates}
                    />
                  </div>
                )}

                <div 
                  onClick={() => { setIsGuestsOpen(!isGuestsOpen); setIsDatesOpen(false); }}
                  className="flex-1 flex items-center px-10 py-5 hover:bg-white/5 rounded-[1.8rem] transition-colors cursor-pointer text-left w-full guests-container"
                >
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-5 transition-colors ${isGuestsOpen ? 'bg-coral-500 text-white' : 'bg-stone-800 text-emerald-400'}`}>
                      {CORE_ICONS.Guests("w-5 h-5")}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-xs font-medium text-stone-500 mb-1">Guests</span>
                      <span className="text-white font-medium text-lg leading-none">{numGuests} guest{numGuests > 1 ? 's' : ''}</span>
                   </div>
                </div>

                {isGuestsOpen && (
                  <div className="absolute top-full left-1/3 mt-4 z-[100] guests-container">
                    <GuestPopover 
                      guests={numGuests} 
                      onSelect={setNumGuests} 
                      onClose={() => setIsGuestsOpen(false)}
                    />
                  </div>
                )}

                <button className="bg-coral-500 hover:bg-coral-600 text-white font-black py-6 px-12 rounded-[1.8rem] transition-all flex items-center space-x-3 shadow-xl shadow-coral-500/20 active:scale-95 w-full md:w-auto mt-4 md:mt-0">
                   {CORE_ICONS.Search("w-6 h-6")}
                   <span className="uppercase text-[12px] tracking-widest">Search</span>
                </button>
             </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 14l-7 7-7-7" /></svg>
        </div>
      </section>

      <FeaturedStays apartments={hostApartments} onSelectApartment={onSelectApartment} />

      {host.premiumConfig && <PremiumLandingExtension config={host.premiumConfig} hostName={host.name} />}

      <footer className="bg-stone-900 text-white py-8">
        <div className="container mx-auto text-center">
          <p className="text-sm text-stone-400">
            &copy; {new Date().getFullYear()} {host.name}. All rights reserved.
          </p>
          <div className="mt-4">
            <button onClick={() => setIsTermsModalOpen(true)} className="text-sm text-stone-400 hover:text-white mx-2">Terms</button>
            <button onClick={() => setIsConditionsModalOpen(true)} className="text-sm text-stone-400 hover:text-white mx-2">Conditions</button>
            <button onClick={() => setIsFaqModalOpen(true)} className="text-sm text-stone-400 hover:text-white mx-2">FAQ</button>
          </div>
        </div>
      </footer>

      <Modal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} title="Terms">
        <p>{host.terms}</p>
      </Modal>

      <Modal isOpen={isConditionsModalOpen} onClose={() => setIsConditionsModalOpen(false)} title="Conditions">
        <p>{host.conditions}</p>
      </Modal>

      <Modal isOpen={isFaqModalOpen} onClose={() => setIsFaqModalOpen(false)} title="FAQ">
        <p>{host.faq}</p>
      </Modal>
    </div>
  );
};
