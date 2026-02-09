
import React, { useState, useMemo } from 'react';
import { Host, Apartment, Booking, BookingStatus, PriceRule, BlockedDate } from '../types';
import { ALL_AMENITIES, THEME_GRAY, CORE_ICONS, UNIT_TITLE_STYLE, CARD_BORDER, EMERALD_ACCENT } from './GuestLandingPage';
import { BookingConfirmationTemplate, BookingCancellationTemplate } from '../components/EmailTemplates';
import { Tag, Trash2, Info, ChevronLeft, ChevronRight, X, History, CalendarDays, Users, DollarSign, Mail, Phone, Share2, Copy, CheckCircle2 } from 'lucide-react';
import { hostHubApi } from '../services/api';
import DatePicker from '../components/DatePicker';

const LABEL_COLOR = 'rgb(168, 162, 158)';

const formatBookingRange = (start: string, end: string) => {
  if (!start || !end) return start || '...';
  const s = new Date(start);
  const e = new Date(end);
  const startStr = s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const endStr = e.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const diffTime = Math.abs(e.getTime() - s.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return (
    <span>
      {startStr} — {endStr} <span className="text-[13px] ml-1 opacity-60">({diffDays} night{diffDays !== 1 ? 's' : ''})</span>
    </span>
  );
};

// Sub-component for managing manual availability overrides
const AvailabilityCalendar: React.FC<{ 
  aptId: string, 
  bookings: Booking[], 
  blockedDates: BlockedDate[], 
  airbnbCalendarDates: string[], 
  loadingIcal: boolean, 
  onToggle: (date: string) => void 
}> = ({ aptId, bookings, blockedDates, airbnbCalendarDates, loadingIcal, onToggle }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  // const startOffset = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const startOffset = (date: Date) => (new Date(date.getFullYear(), date.getMonth(), 1).getDay() + 6) % 7;


  const isBooked = (dateStr: string) => bookings.some(b => b.apartmentId === aptId && dateStr >= b.startDate && dateStr < b.endDate && (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.REQUESTED || b.status === BookingStatus.PAID));
  const isBlockedManually = (dateStr: string) => blockedDates.some(d => d.apartmentId === aptId && d.date === dateStr);
  const isAirbnbBlocked = (dateStr: string) => airbnbCalendarDates.includes(dateStr);

  const renderMonth = (monthDate: Date) => {
    const days = [];
    const numDays = daysInMonth(monthDate);
    const offset = startOffset(monthDate);
    const monthName = monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    for (let i = 0; i < offset; i++) days.push(<div key={`e-${i}`} />);

    for (let d = 1; d <= numDays; d++) {
      const dateObj = new Date(monthDate.getFullYear(), monthDate.getMonth(), d);
      // const dateStr = dateObj.toISOString().split('T')[0];

      const year = dateObj.getFullYear();
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const day = dateObj.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;


      const booked = isBooked(dateStr);
      const blockedManually = isBlockedManually(dateStr);
      const airbnbBlocked = isAirbnbBlocked(dateStr);

      let dayClass = 'bg-stone-900 border-stone-700 text-stone-200 hover:text-white'; 
      
      if (booked) { 
        dayClass = 'bg-blue-500/20 border-blue-500/40 text-blue-500'; 
        const bookingForDay = bookings.find(b => b.apartmentId === aptId && dateStr >= b.startDate && dateStr < b.endDate);
        if (bookingForDay?.status === BookingStatus.REQUESTED) {
            dayClass = 'bg-amber-500/20 border-amber-500/40 text-amber-500'; 
        } else if (bookingForDay?.status === BookingStatus.PAID) {
            dayClass = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500'; 
        }
      } else if (blockedManually) { 
        dayClass = 'bg-rose-500/20 border-rose-500/40 text-rose-500'; 
      } else if (airbnbBlocked) {
        dayClass = 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500'; 
      }

      days.push(
        <button
          key={dateStr}
          onClick={() => onToggle(dateStr)}
          className={`h-12 flex flex-col items-center justify-center text-[10px] font-bold rounded-xl border transition-all ${dayClass}`}
        >
          {d}
        </button>
      );
    }

    return (
      <div className="p-8 bg-[#1c1a19] rounded-[2rem] border" style={{ borderColor: CARD_BORDER }}>
        <div className="flex items-center justify-between mb-8">
           <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="text-stone-500 hover:text-white transition-colors"><ChevronLeft className="w-5 h-5" /></button>
           <h4 className="text-white font-serif text-lg font-bold">{monthName}</h4>
           <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="text-stone-500 hover:text-white transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1.5 mb-2 text-[9px] font-black uppercase tracking-widest text-stone-400 text-center">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <div key={d} className="capitalize">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
            {loadingIcal && (
                <div className="col-span-full h-24 flex items-center justify-center bg-stone-900/50 rounded-lg">
                    <div className="w-8 h-8 border-2 border-stone-700 border-t-white rounded-full animate-spin"></div>
                </div>
            )}
            {!loadingIcal && days}
        </div>
        <div className="mt-8 pt-6 border-t border-stone-800/60 flex flex-wrap gap-4 justify-center text-[10px] uppercase tracking-widest font-bold">
            <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500/20 border border-blue-500/40"></span>
                <span className="text-blue-500/70">HostHub Booked</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500/40"></span>
                <span className="text-rose-500/70">Manual Block</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40"></span>
                <span className="text-yellow-500/70">Airbnb Sync</span>
            </div>
        </div>
      </div>
    );
  };

  return renderMonth(currentMonth);
};

/**
 * Added missing HostDashboardProps interface definition.
 */
interface HostDashboardProps {
  host: Host;
  apartments: Apartment[];
  bookings: Booking[];
  blockedDates: BlockedDate[];
  onUpdateBookings: (bookings: Booking[]) => void;
  onUpdateBlockedDates: (dates: BlockedDate[]) => void;
  onUpdateApartments: (apartments: Apartment[]) => void;
  airbnbCalendarDates: string[]; 
  loadingAirbnbIcal: boolean; 
}

const HostDashboard: React.FC<HostDashboardProps> = ({ 
  host, apartments, bookings, blockedDates, onUpdateBookings, onUpdateBlockedDates, onUpdateApartments, airbnbCalendarDates, loadingAirbnbIcal
}) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'calendar' | 'apartments'>('bookings');
  const [showAptModal, setShowAptModal] = useState<boolean>(false);
  const [editingApt, setEditingApt] = useState<Partial<Apartment> | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'past' | BookingStatus.REQUESTED | BookingStatus.CONFIRMED | BookingStatus.PAID | BookingStatus.CANCELED>('all');
  const [copied, setCopied] = useState(false);

  const myBookings = useMemo(() => bookings.filter(b => apartments.some(a => a.id === b.apartmentId)), [bookings, apartments]);
  const todayStr = new Date().toISOString().split('T')[0];

  const shareableUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/?host=${host.slug}`;
  }, [host.slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleToggleAmenity = (amenity: string) => {
    if (!editingApt) return;
    const currentAmenities = editingApt.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
        ? currentAmenities.filter(a => a !== amenity)
        : [...currentAmenities, amenity];
    setEditingApt({ ...editingApt, amenities: newAmenities });
  };

  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const pending = myBookings.filter(b => b.status === BookingStatus.REQUESTED && b.endDate >= todayStr).length;
    const active = myBookings.filter(b => (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID) && b.endDate >= todayStr).length;
    const pastCount = myBookings.filter(b => b.endDate < todayStr).length;
    const revenueYear = myBookings
        .filter(b => (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID) && new Date(b.startDate).getFullYear() === currentYear)
        .reduce((sum, b) => sum + b.totalPrice, 0);
    return { pending, active, past: pastCount, revenueYear };
  }, [myBookings, todayStr]);

  // Fix: Ensure groupedAndSortedBookings is defined before the main return statement.
  const groupedAndSortedBookings = useMemo(() => {
    const filtered = myBookings.filter(b => {
      const isPast = b.endDate < todayStr;
      if (statusFilter === 'past') return isPast;
      if (statusFilter === BookingStatus.CANCELED) return b.status === BookingStatus.CANCELED;
      if (statusFilter === 'all') return !isPast && b.status !== BookingStatus.CANCELED;
      return !isPast && b.status === statusFilter;
    });

    const sorted = filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const groups = new Map<string, Booking[]>();
    for (const booking of sorted) {
        const apt = apartments.find(a => a.id === booking.apartmentId);
        if (apt) {
            const aptTitle = apt.title;
            if (!groups.has(aptTitle)) groups.set(aptTitle, []);
            groups.get(aptTitle)?.push(booking);
        }
    }
    return Array.from(groups.entries());
  }, [myBookings, apartments, statusFilter, todayStr]);


  const handleUpdateStatus = async (booking: Booking, status: BookingStatus) => {
    onUpdateBookings(bookings.map(b => b.id === booking.id ? { ...b, status } : b));
    const bookedApartment = apartments.find(apt => apt.id === booking.apartmentId);
    if (!bookedApartment) return;

    // Only send an email when a booking is CANCELED
    if (status === BookingStatus.CANCELED) {
      await hostHubApi.sendEmail(
        booking.guestEmail,
        `Update on your booking for ${bookedApartment.title}`,
        'BookingCancellation',
        booking,
        bookedApartment,
        host
      );
    }
  };

  // const toggleManualBlock = (aptId: string, date: string) => {
   // const existingIdx = blockedDates.findIndex(d => d.apartmentId === aptId && d.date === date);
  //  if (existingIdx >= 0) {
  //    onUpdateBlockedDates(blockedDates.filter((_, i) => i !== existingIdx));
  //  } else {
    //  onUpdateBlockedDates([...blockedDates, { id: `block-${Date.now()}`, apartmentId: aptId, date }]);
    //}
  //};
  const toggleManualBlock = (aptId: string, date: string) => {
  // The 'date' from the calendar is the correct 'YYYY-MM-DD' string.
  // We find the date using a direct comparison, which is the same logic
  // that correctly highlights the cell in red.
  const existingIdx = blockedDates.findIndex(d => d.apartmentId === aptId && d.date === date);

  if (existingIdx >= 0) {
    // Found it: remove the date from the array.
    onUpdateBlockedDates(blockedDates.filter((_, i) => i !== existingIdx));
  } else {
    // Didn't find it: add the new date.
    onUpdateBlockedDates([...blockedDates, { id: `block-${Date.now()}`, apartmentId: aptId, date: date }]);
  }
};



  const handleSaveApartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApt) return;
    if (editingApt.id) {
      onUpdateApartments(apartments.map(a => a.id === editingApt.id ? { ...a, ...editingApt } as Apartment : a));
    } else {
      const newApt: Apartment = {
        ...editingApt,
        id: `apt-${Date.now()}`,
        hostId: host.id,
        amenities: editingApt.amenities || [],
        photos: editingApt.photos || ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800&h=600'],
        priceOverrides: editingApt.priceOverrides || [],
        capacity: editingApt.capacity || 2,
        bedrooms: editingApt.bedrooms || 1,
        bathrooms: editingApt.bathrooms || 1,
        pricePerNight: editingApt.pricePerNight || 100,
        title: editingApt.title || 'Untitled sanctuary',
        description: editingApt.description || '',
        city: editingApt.city || '',
        isActive: true,
      } as Apartment;
      onUpdateApartments([...apartments, newApt]);
    }
    setShowAptModal(false);
    setEditingApt(null);
  };

  const addPriceOverride = () => {
    const current = editingApt?.priceOverrides || [];
    setEditingApt({
      ...editingApt,
      priceOverrides: [...current, { id: `pr-${Date.now()}`, startDate: '', endDate: '', price: editingApt?.pricePerNight || 0, label: '' }]
    });
  };

  const removePriceOverride = (id: string) => {
    const current = editingApt?.priceOverrides || [];
    setEditingApt({ ...editingApt, priceOverrides: current.filter(rule => rule.id !== id) });
  };

  const updatePriceRule = (id: string, updates: Partial<PriceRule>) => {
    const current = editingApt?.priceOverrides || [];
    setEditingApt({
      ...editingApt,
      priceOverrides: current.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 animate-in fade-in duration-700 font-dm">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Host Studio</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: LABEL_COLOR }}>Asset Operations</p>
        </div>
        
        {/* Shareable Link Card */}
        <div className="bg-[#1c1a19] border border-stone-800 p-4 rounded-2xl flex items-center justify-between w-full md:w-[450px] shadow-xl">
           <div className="flex items-center space-x-4 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                 <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest mb-1">Your Booking Link</p>
                 <p className="text-xs text-stone-400 font-medium truncate">{shareableUrl}</p>
              </div>
           </div>
           <button 
             onClick={handleCopyLink}
             className={`ml-4 p-3 rounded-xl transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-stone-900 text-stone-500 hover:text-white border border-stone-800'}`}
           >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
           </button>
        </div>
        <button onClick={() => { setEditingApt({}); setShowAptModal(true); }} className="bg-transparent border border-white text-white hover:bg-coral-500/10 px-8 py-3 rounded-full font-bold uppercase text-[11px] tracking-widest transition-all">Add Unit</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="bg-[#1c1a19] p-8 rounded-2xl flex items-center space-x-5 border" style={{ borderColor: CARD_BORDER }}>
            <div style={{ color: EMERALD_ACCENT }}>{CORE_ICONS.Pending("w-8 h-8")}</div>
            <div>
                <h4 className="text-2xl font-bold text-white leading-none">{stats.pending}</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: LABEL_COLOR }}>Pending Requests</p>
            </div>
        </div>
        <div className="bg-[#1c1a19] p-8 rounded-2xl flex items-center space-x-5 border" style={{ borderColor: CARD_BORDER }}>
            <div style={{ color: EMERALD_ACCENT }}>{CORE_ICONS.Bookings("w-8 h-8")}</div>
            <div>
                <h4 className="text-2xl font-bold text-white leading-none">{stats.active}</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: LABEL_COLOR }}>Upcoming Stays</p>
            </div>
        </div>
        <div className="bg-[#1c1a19] p-8 rounded-2xl flex items-center space-x-5 border" style={{ borderColor: CARD_BORDER }}>
            <div style={{ color: EMERALD_ACCENT }}><History className="w-8 h-8" strokeWidth={1.5} /></div>
            <div>
                <h4 className="text-2xl font-bold text-white leading-none">{stats.past}</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: LABEL_COLOR }}>Completed Stays</p>
            </div>
        </div>
        <div className="bg-[#1c1a19] p-8 rounded-2xl flex items-center space-x-5 border" style={{ borderColor: CARD_BORDER }}>
            <div style={{ color: EMERALD_ACCENT }}>{CORE_ICONS.Dollar("w-8 h-8")}</div>
            <div>
                <h4 className="text-2xl font-bold text-white leading-none">${stats.revenueYear.toLocaleString()}</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: LABEL_COLOR }}>Annual Revenue</p>
            </div>
        </div>
      </div>

      <div className="flex bg-[#141211] border border-stone-800/60 p-2 rounded-xl w-fit mb-12">
        {['bookings', 'calendar', 'apartments'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab as any)} 
            className={`px-8 py-4 rounded-lg text-m text-white font-bold transition-all capitalize ${activeTab === tab ? 'bg-sky-950 text-white shadow-lg' : 'text-[rgb(214,213,213)]  hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'bookings' && (
        <div className="space-y-12">
           <div className="flex flex-wrap gap-3 mb-8 px-2">
            {[
                { label: 'All Active', value: 'all', icon: null },
                { label: 'Confirmed', value: BookingStatus.CONFIRMED, icon: null },
                { label: 'Paid', value: BookingStatus.PAID, icon: null },
                { label: 'Past Stays', value: 'past', icon: <History className="w-3.5 h-3.5 mr-1.5" /> },
                { label: 'Canceled', value: BookingStatus.CANCELED, icon: <X className="w-3.5 h-3.5 mr-1.5" /> },
            ].map(filter => (
                <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value as any)}
                    className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center ${
                        statusFilter === filter.value
                            ? 'bg-emerald-900 text-white shadow-l shadow-coral-500/20'
                            : 'bg-stone-900/50 border border-stone-600 text-[rgb(214,213,213)] hover:text-white'
                    }`}
                >
                    {filter.icon}
                    {filter.label}
                </button>
            ))}
          </div>

          {groupedAndSortedBookings.length > 0 ? (
            groupedAndSortedBookings.map(([title, bks]) => (
              <div key={title} className="space-y-6">
                <h3 className="text-2xl font-serif font-bold text-white px-2 tracking-tight">{title}</h3>
                {bks.map(b => (
                  <div key={b.id} className="w-full bg-[#1c1a19] rounded-2xl p-8 border flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all hover:border-stone-700/50" style={{ borderColor: CARD_BORDER }}>
                    <div className="space-y-4 flex-1 text-left">
                      <div className="flex items-center space-x-4">
                        <h4 className="text-2xl font-serif text-white">{b.guestName || (b.guestEmail.split('@')[0].charAt(0).toUpperCase() + b.guestEmail.split('@')[0].slice(1))}</h4>
                        <span className={`px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-black border ${
                          b.status === BookingStatus.PAID ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          b.status === BookingStatus.CONFIRMED ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          'bg-rose-500/10 text-rose-400 border-rose-500/20' // For Canceled
                          }`}>{b.status}</span>
                                      <span className="text-xs text-stone-500 font-mono opacity-60">#{b.customBookingId}</span>

                    </div>
                       
                       <div className="flex flex-wrap items-center gap-x-8 gap-y-2 font-medium" style={{ color: LABEL_COLOR }}>
                          <div className="flex items-center space-x-2">
                            <CalendarDays className="w-4 h-4" />
                            <span className="text-sm">{formatBookingRange(b.startDate, b.endDate)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                             <Users className="w-4 h-4" />
                             <span className="text-sm">{b.numGuests || 1} Guests</span>
                          </div>
                          <div className="flex items-center space-x-2">
                             <DollarSign className="w-4 h-4" />
                             <span className="text-sm">${b.totalPrice.toLocaleString()} Total</span>
                          </div>
                       </div>

                       <div className="flex flex-wrap items-center gap-x-8 gap-y-2 font-medium text-xs" style={{ color: LABEL_COLOR }}>
                          <div className="flex items-center space-x-2">
                             <Mail className="w-3.5 h-3.5" />
                             <span>{b.guestEmail}</span>
                          </div>
                          {b.guestPhone && (
                            <div className="flex items-center space-x-2">
                               <Phone className="w-3.5 h-3.5" />
                               <span>{b.guestPhone}</span>
                            </div>
                          )}
                       </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Show 'Mark as Paid' and 'Cancel' for CONFIRMED bookings */}
                      {statusFilter !== 'past' && b.status === BookingStatus.CONFIRMED && (
                          <>
                              <button onClick={() => handleUpdateStatus(b, BookingStatus.PAID)} className="bg-transparent border border-emerald-500 text-emerald-400 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/10 hover:text-emerald-300 transition-all">Mark as Paid</button>
                              <button onClick={() => handleUpdateStatus(b, BookingStatus.CANCELED)} className="bg-transparent border border-[rgb(178,45,77)] text-rose-600 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-rose-500 hover:text-rose-400 transition-all">Cancel</button>
                          </>
                      )}
                    {/* Show only 'Cancel' for PAID bookings */}
                    {statusFilter !== 'past' && b.status === BookingStatus.PAID && (
                    <button onClick={() => handleUpdateStatus(b, BookingStatus.CANCELED)} className="bg-transparent border border-[rgb(178,45,77)] text-rose-600 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-rose-500 hover:text-rose-400 transition-all">Cancel</button>
                   )}
                    </div>

                  </div>
                ))}
             </div>
           ))
          ) : (
            <div className="py-20 text-center border border-dashed border-stone-800 rounded-[3rem]">
               <p className="text-stone-600 font-medium italic">No bookings match this selection.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-20">
           {apartments.map(apt => (
             <div key={apt.id}>
                <div className="lg:col-span-2 space-y-8 text-left">
                   <h3 className="text-3xl font-serif font-bold text-white tracking-tight">{apt.title}</h3>
                   <p className="text-sm text-stone-500">Manage manual overrides and view occupancy for this unit.</p>
                </div>
                <div className="lg:col-span-3 text-white ">
                   <AvailabilityCalendar 
                      aptId={apt.id} 
                      bookings={bookings} 
                      blockedDates={blockedDates} 
                      airbnbCalendarDates={airbnbCalendarDates}
                      loadingIcal={loadingAirbnbIcal}
                      onToggle={(d) => toggleManualBlock(apt.id, d)} 
                   />
                </div>
             </div>
           ))}
        </div>
      )}

      {activeTab === 'apartments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {apartments.map(apt => (
             <div key={apt.id} className="bg-[#1c1a19] rounded-2xl overflow-hidden shadow-xl border flex flex-col hover:border-emerald-500/30 transition-all" style={{ borderColor: CARD_BORDER }}>
                <img src={apt.photos[0]} className="aspect-video w-full object-cover" alt={apt.title} />
                <div className="p-8 text-left">
                   <h4 className="text-xl font-bold text-white mb-2 leading-tight" style={UNIT_TITLE_STYLE}>{apt.title}</h4>
                   <p className="text-[10px] font-bold tracking-widest mb-10 text-stone-600 uppercase">{apt.city}</p>
                   <div className="flex justify-between items-center pt-6 border-t border-stone-800/60">
                      <p className="text-xl font-bold text-coral-500">${apt.pricePerNight}<span className="text-[10px] text-stone-700 ml-2 font-bold">Base</span></p>
                      <button onClick={() => { setEditingApt(apt); setShowAptModal(true); }} className="px-6 py-2 rounded-xl bg-transparent border border- text-stone-100 text-[10px] font-bold uppercase tracking-widest transition-all">Configure</button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Unit Edit Modal */}
      {showAptModal && editingApt && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300 overflow-y-auto">
           <div className="bg-[#1c1a19] border border-stone-800 w-full max-w-4xl rounded-[3rem] p-10 shadow-2xl space-y-12 my-12 relative text-left font-dm">
              <button onClick={() => { setShowAptModal(false); setEditingApt(null); }} className="absolute top-10 right-10 text-stone-600 hover:text-white transition-colors"><X className="w-8 h-8" /></button>
              <h3 className="text-3xl font-bold text-white leading-none tracking-tight">Unit Configuration</h3>

              <form onSubmit={handleSaveApartment} className="space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">Unit Title</label>
                          <input type="text" required value={editingApt.title || ''} onChange={e => setEditingApt({...editingApt, title: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-coral-500 transition-all outline-none" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">City</label>
                             <input type="text" required value={editingApt.city || ''} onChange={e => setEditingApt({...editingApt, city: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-sm text-white outline-none" />
                          </div>
                          <div>
                             <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">Base Price</label>
                             <input type="number" required value={editingApt.pricePerNight || 0} onChange={e => setEditingApt({...editingApt, pricePerNight: parseInt(e.target.value)})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-sm text-white outline-none" />
                          </div>
                       </div>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">Description</label>
                       <textarea value={editingApt.description || ''} onChange={e => setEditingApt({...editingApt, description: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-sm text-white h-[142px] resize-none focus:ring-1 focus:ring-coral-500 outline-none" />
                    </div>
                 </div>

                 <div className="pt-10 border-t border-stone-800/60">
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-3">
                         <Tag className="w-5 h-5 text-emerald-400" />
                         <h4 className="text-xl font-bold text-white tracking-tight">Seasonal Pricing Overrides</h4>
                      </div>
                      <button type="button" onClick={addPriceOverride} className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-6 py-2 rounded-xl hover:bg-emerald-500/20 transition-all">+ Add Rate Rule</button>
                   </div>
                   
                   <div className="space-y-4">
                      {editingApt.priceOverrides?.map((rule) => (
                        <div key={rule.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-stone-950 p-6 rounded-[1.8rem] border border-stone-800 items-end animate-in slide-in-from-bottom-2">
                           <div>
                              <label className="block text-[10px] font-black uppercase text-[rgb(214,213,213)] mb-2">From Date</label>
                              <DatePicker
                              selectedDate={rule.startDate}
                              onSelect={(date) => updatePriceRule(rule.id, { startDate: date })}
                            />

                           </div>
                           <div>
                              <label className="block text-[10px] font-black uppercase text-[rgb(214,213,213)] mb-2">Until Date</label>
                              <DatePicker
                              selectedDate={rule.endDate}
                              onSelect={(date) => updatePriceRule(rule.id, { endDate: date })}
                            />

                           </div>
                           <div>
                              <label className="block text-[10px] font-black uppercase text-[rgb(214,213,213)] mb-2">Nightly Price ($)</label>
                              <input type="number" value={rule.price} onChange={e => updatePriceRule(rule.id, { price: parseInt(e.target.value) })} className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-xs text-white outline-none" />
                           </div>
                           <button type="button" onClick={() => removePriceOverride(rule.id)} className="p-3 bg-stone-900 border border-stone-800 rounded-xl text-stone-600 hover:text-rose-500 transition-all flex items-center justify-center">
                              <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                      ))}
                      {(!editingApt.priceOverrides || editingApt.priceOverrides.length === 0) && (
                        <div className="py-12 border border-dashed border-stone-800 rounded-[2rem] flex flex-col items-center justify-center text-stone-600 italic text-sm">
                           <Info className="w-6 h-6 mb-2 opacity-20" />
                           <span>No manual price overrides active for this unit.</span>
                        </div>
                      )}
                   </div>



                 </div>
                 <div className="pt-10 border-t border-stone-800/60">
    <div className="flex items-center space-x-3 mb-8">
        <Tag className="w-5 h-5 text-emerald-400" />
        <h4 className="text-xl font-bold text-white tracking-tight">Amenities</h4>
    </div>
    <div className="flex flex-wrap gap-4">
        {ALL_AMENITIES.map(amenity => {
            const isSelected = editingApt.amenities?.includes(amenity.label);
            return (
                <button
                    type="button"
                    key={amenity.label}
                    onClick={() => handleToggleAmenity(amenity.label)}
                    className={`flex items-center space-x-3 px-6 py-4 rounded-2xl border transition-all text-sm font-medium ${
                        isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                >
                    {amenity.icon}
                    <span>{amenity.label}</span>
                </button>
            );
        })}
    </div>
</div>

                 <div className="flex space-x-4 pt-6 border-t border-stone-800/60">
                    <button type="button" onClick={() => { setShowAptModal(false); setEditingApt(null); }} className="flex-1 font-bold py-5 rounded-full border border-stone-800 text-[10px] uppercase tracking-widest text-[rgb(214,213,213)] hover:text-white border-white transition-all">Discard</button>
                    <button type="submit" className="flex-1 bg-transparent border border-coral-500 text-coral-500 hover:bg-coral-500/10 font-bold py-5 rounded-full transition-all text-[10px] uppercase tracking-widest active:scale-95">Save Unit</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      
    </div>
  );
};

export default HostDashboard;