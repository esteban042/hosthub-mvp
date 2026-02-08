import React, { useState, useEffect, useMemo } from 'react';
import { Host, Apartment, Booking, BlockedDate, BookingStatus, PremiumConfig, PremiumSection, PriceRule } from '../types';
import { isOverlapping } from '../services/bookingService'; 
import { 
  Bed, 
  Bath, 
  Users, 
  MapPin, 
  Calendar, 
  Search, 
  Building2, 
  Clock, 
  ClipboardList, 
  DollarSign, 
  Mail, 
  Phone, 
  Edit3,
  Wifi,
  Utensils,
  ParkingCircle,
  Flame,
  Wind,
  WashingMachine,
  Waves,
  Tv,
  Coffee,
  Umbrella,
  ShowerHead,
  FlameKindling,
  CircleHelp
} from 'lucide-react';

interface GuestLandingPageProps {
  host: Host;
  apartments: Apartment[];
  bookings: Booking[];
  blockedDates: BlockedDate[]; 
  airbnbCalendarDates: string[]; 
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
  Bed: (c: string) => <Bed className={c} strokeWidth={1.5} />,
  Bath: (c: string) => <Bath className={c} strokeWidth={1.5} />,
  Guests: (c: string) => <Users className={c} strokeWidth={1.5} />,
  Location: (c: string) => <MapPin className={c} strokeWidth={1.5} />,
  Calendar: (c: string) => <Calendar className={c} strokeWidth={1.5} />,
  Search: (c: string) => <Search className={c} strokeWidth={2.5} />,
  Building: (c: string) => <Building2 className={c} strokeWidth={1.5} />,
  Pending: (c: string) => <Clock className={c} strokeWidth={1.5} />,
  Bookings: (c: string) => <ClipboardList className={c} strokeWidth={1.5} />,
  Dollar: (c: string) => <DollarSign className={c} strokeWidth={1.5} />,
  Mail: (c: string) => <Mail className={c} strokeWidth={1.5} />,
  Phone: (c: string) => <Phone className={c} strokeWidth={1.5} />,
  Edit: (c: string) => <Edit3 className={c} strokeWidth={1.5} />
};

export const AMENITY_ICONS: Record<string, (c: string) => React.ReactElement> = {
  'Wifi': (c) => <Wifi className={c} strokeWidth={1.5} />,
  'Kitchen': (c) => <Utensils className={c} strokeWidth={1.5} />,
  'Free Parking': (c) => <ParkingCircle className={c} strokeWidth={1.5} />,
  'Fireplace': (c) => <Flame className={c} strokeWidth={1.5} />,
  'Air Conditioning': (c) => <Wind className={c} strokeWidth={1.5} />,
  'Washer': (c) => <WashingMachine className={c} strokeWidth={1.5} />,
  'Pool': (c) => <Waves className={c} strokeWidth={1.5} />,
  'TV': (c) => <Tv className={c} strokeWidth={1.5} />,
  'Coffee Maker': (c) => <Coffee className={c} strokeWidth={1.5} />,
  'Beach Access': (c) => <Umbrella className={c} strokeWidth={1.5} />,
  'Outdoor Shower': (c) => <ShowerHead className={c} strokeWidth={1.5} />,
  'BBQ Grill': (c) => <FlameKindling className={c} strokeWidth={1.5} />,
  'Default': (c) => <CircleHelp className={c} strokeWidth={1.5} />
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
  apartment?: Apartment, 
  allBookings: Booking[], 
  allBlockedDates: BlockedDate[], 
  airbnbBlockedDates: string[], 
}> = ({ onSelect, startDate, endDate, apartment, allBookings, allBlockedDates, airbnbBlockedDates }) => {
  const [month, setMonth] = useState(new Date());
  
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const offset = new Date(month.getFullYear(), month.getMonth(), 1).getDay();

  const getPriceForDate = (dateStr: string) => {
    if (!apartment) return null;
    const override = apartment.priceOverrides?.find((rule: PriceRule) => dateStr >= rule.startDate && dateStr <= rule.endDate);
    return override ? override.price : (apartment.pricePerNight || 0);
  };

  const isBooked = (dateStr: string) =>
    allBookings.some(
      (b) =>
        b.apartmentId === apartment?.id && 
        (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.REQUESTED || b.status === BookingStatus.PAID) &&
        isOverlapping(dateStr, dateStr + 'T23:59:59', b.startDate, b.endDate) 
    );

  const isBlockedManually = (dateStr: string) =>
    allBlockedDates.some(
      (d) =>
        (d.apartmentId === apartment?.id || d.apartmentId === 'all') &&
        d.date === dateStr
    );

  const isAirbnbBlocked = (dateStr: string) => airbnbBlockedDates.includes(dateStr);

  const handleDayClick = (dateStr: string) => {
    const isDayUnavailable = isBooked(dateStr) || isBlockedManually(dateStr) || isAirbnbBlocked(dateStr);
    if (isDayUnavailable) return; 

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

    const isCurrentlyBooked = isBooked(dStr);
    const isCurrentlyBlockedManually = isBlockedManually(dStr);
    const isCurrentlyAirbnbBlocked = isAirbnbBlocked(dStr);
    const isUnavailable = isCurrentlyBooked || isCurrentlyBlockedManually || isCurrentlyAirbnbBlocked;

    let dayClass = 'text-stone-300 hover:bg-stone-800'; 
    
    if (isSelected) {
      dayClass = 'bg-coral-500 text-white border-coral-500';
    } else if (inRange) {
      dayClass = 'bg-coral-500/20 text-coral-500 border-coral-500/10';
    } else if (isUnavailable) {
      dayClass = 'bg-stone-900 border-stone-800 text-stone-600 cursor-not-allowed line-through'; 
    }

    days.push(
      <button 
        key={dStr} onClick={() => handleDayClick(dStr)}
        disabled={isUnavailable} 
        className={`flex flex-col items-center justify-center rounded-xl transition-all ${
          apartment ? 'h-14 w-full border border-transparent' : 'h-10 w-10'
        } ${dayClass}`}
      >
        <span className={`${apartment ? 'text-[11px] font-bold' : 'text-xs font-bold'}`}>{d}</span>
        {price !== null && <span className={`text-[8px] font-medium ${isUnavailable ? 'text-stone-700' : isSelected ? 'text-white/80' : 'text-stone-500'}`}>${price}</span>}
      </button>
    );
  }

  return (
    <div className={`p-6 bg-stone-950 border border-stone-800 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 ${apartment ? 'w-full' : 'w-[320px]'}`}>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="text-stone-500 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7"/></svg></button>
        <span className="text-white font-serif font-bold text-sm">{month.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="text-stone-500 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7"/></svg></button>
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

const PremiumLandingExtension: React.FC<{ config: PremiumConfig, hostName: string }> = ({ config, hostName }) => {
  if (!config.isEnabled) return null;

  return (
    <div className="mt-40 space-y-40 animate-in fade-in duration-1000">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400">Host Feature</span>
        <h2 className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tight leading-tight">
          Beyond the <span className="text-coral-500 italic">Ordinary</span>
        </h2>
        <p className="text-xl text-[#cfcece] font-medium leading-relaxed max-w-2xl mx-auto">
          We don't just provide accommodation; we curate environments where memories take root and flourish. Explore the heart of our hospitality.
        </p>
      </div>

      <div className="space-y-32">
        {config.sections.map((section: PremiumSection, idx: number) => {
          const isEven = idx % 2 === 0;
          const imageUrl = config.images[idx % config.images.length];
          const secondImageUrl = config.images[(idx + 1) % config.images.length];

          return (
            <div key={idx} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 lg:gap-24 items-center`}>
              <div className="w-full lg:w-1/2 relative">
                <div className={`aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-stone-800 shadow-2xl relative z-10 ${isEven ? 'ml-0' : 'ml-auto'}`}>
                  <img src={imageUrl} className="w-full h-full object-cover" alt={section.title} />
                  <div className="absolute inset-0 bg-stone-950/10 hover:bg-transparent transition-colors duration-500" />
                </div>
                <div className={`absolute -bottom-12 ${isEven ? '-right-12' : '-left-12'} hidden lg:block w-48 h-64 rounded-2xl overflow-hidden border-4 border-stone-950 shadow-2xl z-20`}>
                   <img src={secondImageUrl} className="w-full h-full object-cover" alt="Detail" />
                </div>
              </div>

              <div className="w-full lg:w-1/2 space-y-8">
                <div className="flex items-center space-x-4">
                  <span className="text-coral-500 font-serif text-5xl opacity-30 italic">0{idx + 1}</span>
                  <div className="h-px w-12 bg-stone-800"></div>
                  <h3 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">{section.title}</h3>
                </div>
                <p className="text-xl leading-relaxed text-[#cfcece] font-medium">
                  {section.content}
                </p>
                <div className="pt-4">
                  <div className="inline-flex items-center space-x-3 text-stone-500 border-b border-stone-800 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest">HostHub Verified</span>
                    <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {config.images.length > 3 && (
        <div className="pt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[400px]">
            {config.images.slice(0, 4).map((img: string, i: number) => (
              <div key={i} className={`rounded-3xl overflow-hidden border border-stone-800 relative group h-full ${i % 2 === 0 ? 'mt-8' : 'mb-8'}`}>
                <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={`Gallery ${i}`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const GuestLandingPage: React.FC<GuestLandingPageProps> = ({ 
  host, apartments, onSelectApartment, bookings, blockedDates, airbnbCalendarDates
}) => {
  const [isDatesOpen, setIsDatesOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [dates, setDates] = useState({ start: '', end: '' });
  const [numGuests, setNumGuests] = useState(1);

  return (
    <div className="min-h-screen">
      <section className="relative h-[100vh] flex flex-col items-center justify-center text-center px-6 hero-gradient">
        <div className="z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <p className="text-[12px] font-black uppercase tracking-[0.6em] text-emerald-400 mb-6">Welcome to HostHub</p>
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
                      allBookings={bookings}
                      allBlockedDates={blockedDates}
                      airbnbBlockedDates={airbnbCalendarDates}
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
                  <span className="text-white font-black text-xl">${apt.pricePerNight || 0}</span>
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

        {host.premiumConfig && <PremiumLandingExtension config={host.premiumConfig} hostName={host.name} />}
      </section>
    </div>
  );
};