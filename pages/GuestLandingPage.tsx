import React, { useState, useEffect, useMemo } from 'react';
import { Host, Apartment, Booking, BlockedDate, BookingStatus } from '../types';

interface GuestLandingPageProps {
  host: Host;
  apartments: Apartment[];
  bookings: Booking[];
  blockedDates: BlockedDate[];
  onNewBooking: (booking: Booking) => void;
  onSelectApartment: (id: string) => void;
}

export const ALL_AMENITIES = ['Wifi', 'Kitchen', 'Free Parking', 'Fireplace', 'Air Conditioning', 'Washer', 'Pool', 'TV', 'Coffee Maker', 'Beach Access', 'Outdoor Shower', 'BBQ Grill'];

export const THEME_GRAY = 'rgb(168, 162, 158)';
export const EMERALD_ACCENT = 'rgb(16 185 129 / 0.8)';
export const AMENITY_GREEN = 'hsl(153 31% 55%)';
export const CARD_BG = 'hsl(0 0% 13%)';
export const CARD_BORDER = 'hsl(30 5% 20%)';

export const UNIT_TITLE_STYLE: React.CSSProperties = {
  letterSpacing: '-0.02em',
};

export const CORE_ICONS = {
  Bed: (c: string) => (
    <svg className={c} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 13v-2h10v2h2v-6a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v6h2zm11-4h1V7h-1v2zM5 7h1V7H5v2zM21 14H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1zm-1 4H4v-2h16v2z"/>
    </svg>
  ),
  Bath: (c: string) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10 4L8 6M17 19v2M2 12h20M7 19v2M9 5L7.6 3.6A2 2 0 004 5v12a2 2 0 002 2h12a2 2 0 002-2v-5" /></svg>,
  Guests: (c: string) => (
    <svg className={c} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  ),
  Location: (c: string) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  Calendar: (c: string) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
  Search: (c: string) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>,
  Building: (c: string) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Pending: (c: string) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Bookings: (c: string) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  Dollar: (c: string) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Mail: (c: string) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Phone: (c: string) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  Edit: (c: string) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
};

export const AMENITY_ICONS: Record<string, (c: string) => React.ReactElement> = {
  'Wifi': (c) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>,
  'Kitchen': (c) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v18H3V3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 3v18M3 9h18" /></svg>,
  'Free Parking': (c) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10h14m-14 4h14M5 10v4m14-4v4M5 10l-2 8h18l-2-8M9 10v4m3-4v4m3-4v4" /></svg>,
  'Fireplace': (c) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857" /></svg>,
  'Air Conditioning': (c) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 15h18M3 18h18" /></svg>,
  'Washer': (c) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  'Pool': (c) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" /></svg>,
  'TV': (c) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9h14M4 15h14" /></svg>,
  'Coffee Maker': (c) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>,
  'Beach Access': (c) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>,
  'Outdoor Shower': (c) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>,
  'BBQ Grill': (c) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4" /></svg>,
  'Default': (c) => <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>
};

export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};

export const HeroCalendar: React.FC<{ 
  onSelect: (start: string, end: string) => void,
  startDate: string,
  endDate: string,
  apartment?: Apartment // For price display if provided
}> = ({ onSelect, startDate, endDate, apartment }) => {
  const [month, setMonth] = useState(new Date());
  
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const offset = new Date(month.getFullYear(), month.getMonth(), 1).getDay();

  const getPriceForDate = (dateStr: string) => {
    if (!apartment) return null;
    const override = apartment.priceOverrides?.find(rule => dateStr >= rule.startDate && dateStr <= rule.endDate);
    return override ? override.price : apartment.pricePerNight;
  };

  const handleDayClick = (dateStr: string) => {
    if (!startDate || (startDate && endDate)) {
      onSelect(dateStr, '');
    } else {
      if (dateStr < startDate) {
        onSelect(dateStr, '');
      } else {
        onSelect(startDate, dateStr);
      }
    }
  };

  const days = [];
  for (let i = 0; i < offset; i++) days.push(<div key={`e-${i}`} />);
  for (let d = 1; d <= daysInMonth(month); d++) {
    const dObj = new Date(month.getFullYear(), month.getMonth(), d);
    const dStr = dObj.toISOString().split('T')[0];
    const isSelected = dStr === startDate || dStr === endDate;
    const inRange = startDate && endDate && dStr >= startDate && dStr <= endDate;
    const price = getPriceForDate(dStr);

    days.push(
      <button 
        key={dStr} onClick={() => handleDayClick(dStr)}
        className={`flex flex-col items-center justify-center rounded-xl transition-all ${
          apartment ? 'h-14 w-full border border-transparent' : 'h-10 w-10'
        } ${
          isSelected 
            ? 'bg-coral-500 text-white border-coral-500' 
            : inRange 
              ? 'bg-coral-500/20 text-coral-500 border-coral-500/10' 
              : 'text-stone-300 hover:bg-stone-800'
        }`}
      >
        <span className={`${apartment ? 'text-[11px] font-bold' : 'text-xs font-bold'}`}>{d}</span>
        {price && <span className={`text-[8px] font-medium ${isSelected ? 'text-white/80' : 'text-stone-500'}`}>${price}</span>}
      </button>
    );
  }

  return (
    <div className={`p-6 bg-stone-950 border border-stone-800 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 ${apartment ? 'w-full' : 'w-[320px]'}`}>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="text-stone-500 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeWidth={3}/></svg></button>
        <span className="text-white font-serif font-bold text-sm">{month.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="text-stone-500 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth={3}/></svg></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-[9px] font-black text-stone-600 text-center mb-2 uppercase tracking-widest">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">{days}</div>
    </div>
  );
};

const GuestPopover: React.FC<{
  guests: number;
  onSelect: (val: number) => void;
  onClose: () => void;
}> = ({ guests, onSelect, onClose }) => {
  return (
    <div className="p-8 bg-stone-950 border border-stone-800 rounded-3xl shadow-2xl w-[300px] animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <span className="text-white font-serif font-bold text-lg">Guests</span>
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Select capacity</span>
        </div>
      </div>
      <div className="flex items-center justify-between p-4 bg-stone-900 border border-stone-800 rounded-2xl">
        <button 
          onClick={() => guests > 1 && onSelect(guests - 1)}
          className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center text-white hover:border-coral-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M20 12H4" /></svg>
        </button>
        <span className="text-xl font-black text-white">{guests}</span>
        <button 
          onClick={() => guests < 10 && onSelect(guests + 1)}
          className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center text-white hover:border-coral-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>
      <button onClick={onClose} className="w-full mt-6 bg-coral-500 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-coral-500/20 active:scale-95">Apply</button>
    </div>
  );
};

export const GuestLandingPage: React.FC<GuestLandingPageProps> = ({ 
  apartments, onSelectApartment 
}) => {
  const [isDatesOpen, setIsDatesOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [dates, setDates] = useState({ start: '', end: '' });
  const [numGuests, setNumGuests] = useState(1);

  return (
    <div className="min-h-screen">
      <section className="relative h-[100vh] flex flex-col items-center justify-center text-center px-6 hero-gradient">
        <div className="z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <p className="text-[12px] font-black uppercase tracking-[0.6em] text-emerald-400 mb-6">Welcome to Wanderlust</p>
          <h1 className="text-6xl md:text-9xl font-serif font-bold text-white leading-tight tracking-tight">
            Your Perfect Escape <br/>
            <span className="text-coral-500 italic">Awaits</span>
          </h1>
          <p className="mt-8 text-xl md:text-2xl text-stone-400 max-w-3xl mx-auto font-medium leading-relaxed">
            Discover handpicked luxury apartments and villas for your next unforgettable getaway. Where comfort meets elegance.
          </p>

          <div className="mt-16 w-full max-w-5xl mx-auto">
             <div className="bg-stone-900/60 backdrop-blur-2xl border border-stone-800 rounded-[2.5rem] p-3 flex flex-col md:flex-row items-center gap-1 shadow-2xl relative z-[60]">
                
                <div 
                  onClick={() => { setIsDatesOpen(!isDatesOpen); setIsGuestsOpen(false); }}
                  className="flex-1 flex items-center px-10 py-5 hover:bg-white/5 rounded-[1.8rem] transition-colors cursor-pointer text-left w-full border-b md:border-b-0 md:border-r border-stone-800/50 group"
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
                  <div className="absolute top-full left-0 mt-4 z-[100]">
                    <HeroCalendar 
                      startDate={dates.start} endDate={dates.end} 
                      onSelect={(s, e) => {
                        setDates({ start: s, end: e });
                        if (s && e) setIsDatesOpen(false);
                      }} 
                    />
                  </div>
                )}

                <div 
                  onClick={() => { setIsGuestsOpen(!isGuestsOpen); setIsDatesOpen(false); }}
                  className="flex-1 flex items-center px-10 py-5 hover:bg-white/5 rounded-[1.8rem] transition-colors cursor-pointer text-left w-full"
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
                  <div className="absolute top-full left-1/3 mt-4 z-[100]">
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

      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="mb-16">
          <h2 className="text-5xl font-serif font-bold text-white mb-2 tracking-tight">Featured stays</h2>
          <p className="text-stone-500 text-lg font-medium">{apartments.length} properties available</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {apartments.map((apt, idx) => (
            <div 
              key={apt.id} 
              onClick={() => onSelectApartment(apt.id)}
              className="group cursor-pointer animate-in fade-in duration-700"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-6 border border-stone-800 shadow-xl">
                <img src={apt.photos[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms]" alt={apt.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="absolute bottom-4 left-4 bg-stone-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-lg">
                  <span className="text-white font-black text-xl">${apt.pricePerNight}</span>
                  <span className="text-[10px] font-bold text-stone-400 ml-1 uppercase">/ night</span>
                </div>
              </div>

              <div className="px-1">
                <h3 className="text-2xl font-serif font-bold text-white tracking-tight mb-1 leading-none">{apt.title}</h3>
                
                <div className="flex items-center space-x-2 text-[12px] font-bold uppercase tracking-[0.15em] text-stone-500 mb-6 mt-2">
                  <div className="text-stone-500">{CORE_ICONS.Location("w-3.5 h-3.5")}</div>
                  <span>{apt.city}</span>
                </div>

                <div className="flex items-center space-x-10">
                   <div className="flex items-center space-x-2">
                     <div className="text-stone-500">{CORE_ICONS.Bed("w-4 h-4")}</div>
                     <span className="text-stone-400 font-medium text-sm">{apt.bedrooms}</span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <div className="text-stone-500">{CORE_ICONS.Bath("w-4 h-4")}</div>
                     <span className="text-stone-400 font-medium text-sm">{apt.bathrooms}</span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <div className="text-stone-500">{CORE_ICONS.Guests("w-4 h-4")}</div>
                     <span className="text-stone-400 font-medium text-sm">{apt.capacity}</span>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};