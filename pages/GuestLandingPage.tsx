
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Host, Apartment, Booking, BlockedDate } from '../types.js';
import { formatDate } from '../utils/dates.js';
import { CORE_ICONS, SKY_ACCENT } from '../constants.tsx';
import HeroCalendar from '../components/HeroCalendar.js';
import GuestPopover from '../components/GuestPopover.js';
import FeaturedStays from '../components/FeaturedStays.js';
import PremiumLandingExtension from '../components/PremiumLandingExtension.js';
import Modal from '../components/Modal.js';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";

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

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

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

  const particleOptions = {
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse"
        },
        resize: true
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4
        }
      }
    },
    particles: {
      color: {
        value: "#333333" // Charcoal
      },
      links: {
        color: "#333333", // Charcoal
        distance: 150,
        enable: true,
        opacity: 0.1,
        width: 1
      },
      collisions: {
        enable: true
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce"
        },
        random: false,
        speed: 1,
        straight: false
      },
      number: {
        density: {
          enable: true,
          area: 800
        },
        value: 80
      },
      opacity: {
        value: 0.1
      },
      shape: {
        type: "circle"
      },
      size: {
        value: { min: 1, max: 5 }
      }
    },
    detectRetina: true
  }

  return (
    <div className="min-h-screen bg-alabaster text-charcoal">
       <section
        className="relative h-[100vh] flex flex-col items-center justify-center text-center px-6 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(242, 240, 230, 0.1), rgba(242, 240, 230, 0.9)), url(${host.premiumConfig?.heroImage || 'https://images.unsplash.com/photo-1499678329028-101435549a4e?q=80&w=2940&auto=format&fit=crop'})`,
        }}
      >
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={particleOptions}
            className="absolute top-0 left-0 w-full h-full z-0"
        />
        <div className="z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <p className="text-[12px] font-black uppercase tracking-[0.6em] text-emerald-accent mb-6">Welcome to Sanctum</p>
          <h1 className="text-6xl md:text-9xl font-serif font-bold text-charcoal leading-tight tracking-tight">
            Your Perfect Escape <br/>
            <span className="text-terracotta italic">Awaits</span>
          </h1>
          <p className="mt-8 text-xl md:text-2xl text-charcoal/80 max-w-3xl mx-auto font-medium leading-relaxed">
            Discover handpicked apartments and villas for your next unforgettable getaway. Where comfort meets hospitality.
          </p>

          <div className="mt-16 w-full max-w-5xl mx-auto">
             <div className="bg-white/50 backdrop-blur-2xl border border-charcoal/10 rounded-[2.5rem] p-3 flex flex-col md:flex-row items-center gap-1 shadow-2xl relative z-[60]">
                
                <div 
                  onClick={() => { setIsDatesOpen(!isDatesOpen); setIsGuestsOpen(false); }}
                  className="flex-1 flex items-center px-10 py-5 hover:bg-white/20 rounded-[1.8rem] transition-colors cursor-pointer text-left w-full border-b md:border-b-0 md:border-r border-charcoal/10 group calendar-container"
                >
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-5 transition-colors text-sky-accent ${isDatesOpen ? 'bg-terracotta' : 'bg-black/5'}`}>
                      {CORE_ICONS.Calendar("w-5 h-5")}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-xs font-medium text-charcoal/60 mb-1">Check in — Check out</span>
                      <span className="text-charcoal font-medium text-lg leading-none">
                        {dates.start ? `${formatDate(dates.start)} — ${formatDate(dates.end) || '...'}` : 'Select dates'}
                      </span>
                   </div>
                </div>

                {isDatesOpen && (
                  <div className="absolute top-full left-0 mt-4 z-[100] calendar-container bg-alabaster rounded-2xl shadow-lg border border-stone-200 p-4">
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
                  className="flex-1 flex items-center px-10 py-5 hover:bg-white/20 rounded-[1.8rem] transition-colors cursor-pointer text-left w-full guests-container"
                >
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-5 transition-colors text-sky-accent ${isGuestsOpen ? 'bg-terracotta' : 'bg-black/5'}`}>
                      {CORE_ICONS.Guests("w-5 h-5")}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-xs font-medium text-charcoal/60 mb-1">Guests</span>
                      <span className="text-charcoal font-medium text-lg leading-none">{numGuests} guest{numGuests > 1 ? 's' : ''}</span>
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

                <button 
                  className="bg-transparent border border-sky-700 text-sky-700 font-black hover:bg-sky-700 hover:text-white py-6 px-12 rounded-[1.8rem] transition-all flex items-center space-x-3 shadow-xl shadow-sky-700/20 active:scale-95 w-full md:w-auto mt-4 md:mt-0">
                   {CORE_ICONS.Search("w-6 h-6")}
                   <span className="uppercase text-[12px] tracking-widest">Search</span>
                </button>
             </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <svg className="w-6 h-6 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 14l-7 7-7-7" /></svg>
        </div>
      </section>

      <FeaturedStays apartments={hostApartments} onSelectApartment={onSelectApartment} />

      {host.premiumConfig && <PremiumLandingExtension config={host.premiumConfig} hostName={host.name} />}

      <footer className="bg-alabaster text-charcoal py-12">
        <div className="container mx-auto text-center">
          <div className="flex justify-center items-center space-x-4 mb-4">
              {host.socialMediaLinks?.twitter && <a href={host.socialMediaLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-charcoal/60 hover:text-charcoal">{CORE_ICONS.X("w-6 h-6")}</a>}
              {host.socialMediaLinks?.instagram && <a href={host.socialMediaLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-charcoal/60 hover:text-charcoal">{CORE_ICONS.Instagram("w-6 h-6")}</a>}
              {host.socialMediaLinks?.facebook && <a href={host.socialMediaLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-charcoal/60 hover:text-charcoal">{CORE_ICONS.Facebook("w-6 h-6")}</a>}
          </div>
          <p className="text-2xl font-bold">{host.name}</p>
          <p className="text-sm text-charcoal/60">&copy; {new Date().getFullYear()}. All rights reserved.</p>
          <div className="mt-4">
              <button onClick={() => setIsTermsModalOpen(true)} className="text-sm text-charcoal/60 hover:text-charcoal mx-2">Terms</button>
              <button onClick={() => setIsConditionsModalOpen(true)} className="text-sm text-charcoal/60 hover:text-charcoal mx-2">Conditions</button>
              <button onClick={() => setIsFaqModalOpen(true)} className="text-sm text-charcoal/60 hover:text-charcoal mx-2">FAQ</button>
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
