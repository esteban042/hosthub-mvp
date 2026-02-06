
import React, { useState, useMemo, useEffect, useCallback } from 'react';
// Added BlockedDate to imports
import { Host, Apartment, Booking, BookingStatus, PriceRule, BlockedDate } from '../types';
import { ALL_AMENITIES, THEME_GRAY, CORE_ICONS, UNIT_TITLE_STYLE, CARD_BORDER, EMERALD_ACCENT } from './GuestLandingPage';
import { fetchAndParseIcal } from '../services/api'; 
import { BookingConfirmationTemplate, BookingCancellationTemplate } from '../components/EmailTemplates';

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
      {startStr} - {endStr} <span className="text-stone-500 text-[13px] ml-1">({diffDays} night{diffDays !== 1 ? 's' : ''})</span>
    </span>
  );
};

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
  const startOffset = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

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
      const dateStr = dateObj.toISOString().split('T')[0];
      const booked = isBooked(dateStr);
      const blockedManually = isBlockedManually(dateStr);
      const airbnbBlocked = isAirbnbBlocked(dateStr);

      let dayClass = 'bg-stone-900 border-stone-800 text-stone-500 hover:text-white'; 
      
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
           <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="text-stone-500 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" /></svg></button>
           <h4 className="text-white font-serif text-lg font-bold">{monthName}</h4>
           <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="text-stone-500 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" /></svg></button>
        </div>
        <div className="grid grid-cols-7 gap-1.5 mb-2 text-[8px] font-black uppercase tracking-widest text-stone-700 text-center">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="capitalize">{d}</div>)}
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
                <span className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500/40"></span>
                <span className="text-blue-500">Booked (HostHub)</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/40"></span>
                <span className="text-rose-500">Blocked (Manual)</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40"></span>
                <span className="text-yellow-500">Blocked (Airbnb)</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-stone-900 border border-stone-800"></span>
                <span className="text-stone-500">Available</span>
            </div>
        </div>
      </div>
    );
  };

  return renderMonth(currentMonth);
};

const HostDashboard: React.FC<HostDashboardProps> = ({ 
  host, apartments, bookings, blockedDates, onUpdateBookings, onUpdateBlockedDates, onUpdateApartments, airbnbCalendarDates, loadingAirbnbIcal
}) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'calendar' | 'apartments'>('bookings');
  const [showAptModal, setShowAptModal] = useState<boolean>(false);
  const [editingApt, setEditingApt] = useState<Partial<Apartment> | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus.REQUESTED | BookingStatus.CONFIRMED | BookingStatus.PAID>('all');
  const [previewBooking, setPreviewBooking] = useState<{booking: Booking, type: 'confirmation' | 'cancellation'} | null>(null);

  const myBookings = useMemo(() => bookings.filter(b => apartments.some(a => a.id === b.apartmentId)), [bookings, apartments]);
  
  const stats = useMemo(() => {
    const today = new Date();
    const currentMonthNum = today.getMonth(); 
    const currentYear = today.getFullYear();

    const getBookingsForPeriod = (month?: number, year: number = currentYear) => {
        return myBookings.filter(b => {
            const bookingStartDate = new Date(b.startDate);
            const bookingYear = bookingStartDate.getFullYear();
            const bookingMonth = bookingStartDate.getMonth();
            const matchYear = bookingYear === year;
            const matchMonth = month === undefined || bookingMonth === month;
            return matchYear && matchMonth;
        });
    };

    const currentMonthBookings = getBookingsForPeriod(currentMonthNum, currentYear);
    const revenueMonth = currentMonthBookings.filter(b => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID).reduce((sum, b) => sum + b.totalPrice, 0);
    const currentYearBookings = getBookingsForPeriod(undefined, currentYear); 
    const revenueYear = currentYearBookings.filter(b => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID).reduce((sum, b) => sum + b.totalPrice, 0);

    return {
        assets: apartments.length,
        pendingMonth: currentMonthBookings.filter(b => b.status === BookingStatus.REQUESTED).length, 
        confirmedMonth: currentMonthBookings.filter(b => b.status === BookingStatus.CONFIRMED).length, 
        paidMonth: currentMonthBookings.filter(b => b.status === BookingStatus.PAID).length, 
        revenueMonth,
        pendingYear: currentYearBookings.filter(b => b.status === BookingStatus.REQUESTED).length, 
        confirmedYear: currentYearBookings.filter(b => b.status === BookingStatus.CONFIRMED).length, 
        paidYear: currentYearBookings.filter(b => b.status === BookingStatus.PAID).length, 
        revenueYear,
    };
  }, [apartments, myBookings]);

  const handleUpdateStatus = (booking: Booking, status: BookingStatus) => {
    onUpdateBookings(bookings.map(b => b.id === booking.id ? { ...b, status } : b));
    
    // Trigger preview when confirming or rejecting
    if (status === BookingStatus.CONFIRMED) {
      setPreviewBooking({ booking, type: 'confirmation' });
    } else if (status === BookingStatus.REJECTED || status === BookingStatus.CANCELED) {
      setPreviewBooking({ booking, type: 'cancellation' });
    }
  };

  const toggleManualBlock = (aptId: string, date: string) => {
    const existingIdx = blockedDates.findIndex(d => d.apartmentId === aptId && d.date === date);
    if (existingIdx >= 0) {
      onUpdateBlockedDates(blockedDates.filter((_, i) => i !== existingIdx));
    } else {
      onUpdateBlockedDates([...blockedDates, { id: `block-${Date.now()}`, apartmentId: aptId, date }]);
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
        mapEmbedUrl: editingApt.mapEmbedUrl || undefined, 
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

  const handleAddPhoto = () => {
    if (!newPhotoUrl) return;
    const currentPhotos = editingApt?.photos || [];
    setEditingApt({ ...editingApt, photos: [...currentPhotos, newPhotoUrl] });
    setNewPhotoUrl('');
  };

  const handleRemovePhoto = (idx: number) => {
    const currentPhotos = editingApt?.photos || [];
    setEditingApt({ ...editingApt, photos: currentPhotos.filter((_, i) => i !== idx) });
  };

  const groupedAndSortedBookings = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const upcomingBookings = myBookings
        .filter(b => statusFilter === 'all' || b.status === statusFilter) 
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const groups = new Map<string, Booking[]>();
    for (const booking of upcomingBookings) {
        const apt = apartments.find(a => a.id === booking.apartmentId);
        if (apt) {
            const aptTitle = apt.title;
            if (!groups.has(aptTitle)) {
                groups.set(aptTitle, []);
            }
            groups.get(aptTitle)?.push(booking);
        }
    }
    
    return Array.from(groups.entries()).sort(([, bookingsA], [, bookingsB]) => {
        const earliestA = bookingsA[0] ? new Date(bookingsA[0].startDate).getTime() : Infinity;
        const earliestB = bookingsB[0] ? new Date(bookingsB[0].startDate).getTime() : Infinity;
        return earliestA - earliestB;
    });
  }, [myBookings, apartments, statusFilter]); 


  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 animate-in fade-in duration-700 font-dm">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Host studio</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: LABEL_COLOR }}>Operational management</p>
        </div>
        <button onClick={() => { setEditingApt({}); setShowAptModal(true); }} className="bg-transparent border border-coral-500 text-coral-500 hover:bg-coral-500/10 px-8 py-3 rounded-full font-bold uppercase text-[10px] tracking-widest transition-all">Add unit</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div key="total-units" className="bg-[#1c1a19] p-8 rounded-2xl flex items-center space-x-5 border-[1px]" style={{ borderColor: CARD_BORDER }}>
            <div className="flex-shrink-0" style={{ color: EMERALD_ACCENT }}>{CORE_ICONS.Building("w-8 h-8")}</div>
            <div className="flex flex-col">
                <h4 className={`text-2xl font-dm font-bold text-[#cfcece] leading-none`}>
                  {stats.assets} <span className="text-xl font-bold text-[#cfcece] ml-2">Total Units</span>
                </h4>
            </div>
        </div>
        <div key="pending-requests" className="bg-[#1c1a19] p-8 rounded-2xl flex items-center space-x-5 border-[1px]" style={{ borderColor: CARD_BORDER }}>
            <div className="flex-shrink-0" style={{ color: EMERALD_ACCENT }}>{CORE_ICONS.Pending("w-8 h-8")}</div>
            <div className="flex flex-col">
                <h4 className={`text-2xl font-dm font-bold text-[#cfcece] leading-none mb-1`}>
                    {stats.pendingMonth}
                    <span className="text-xl font-bold text-[#cfcece] ml-2">this month</span>
                </h4>
                <p className="font-medium text-[#cfcece]" style={{ fontSize: '0.875rem' }}>
                    {stats.pendingYear}
                    <span className="text-[#cfcece] ml-1">this year</span>
                </p>
            </div>
        </div>
        <div key="confirmed-stays" className="bg-[#1c1a19] p-8 rounded-2xl flex items-center space-x-5 border-[1px]" style={{ borderColor: CARD_BORDER }}>
            <div className="flex-shrink-0" style={{ color: EMERALD_ACCENT }}>{CORE_ICONS.Bookings("w-8 h-8")}</div>
            <div className="flex flex-col">
                <h4 className={`text-2xl font-dm font-bold text-[#cfcece] leading-none mb-1`}>
                    {stats.confirmedMonth}
                    <span className="text-xl font-bold text-[#cfcece] ml-2">this month</span>
                </h4>
                <p className="font-medium text-[#cfcece]" style={{ fontSize: '0.875rem' }}>
                    {stats.confirmedYear}
                    <span className="text-[#cfcece] ml-1">this year</span>
                </p>
            </div>
        </div>
        <div key="total-revenue" className="bg-[#1c1a19] p-8 rounded-2xl flex items-center space-x-5 border-[1px]" style={{ borderColor: CARD_BORDER }}>
            <div className="flex-shrink-0" style={{ color: EMERALD_ACCENT }}>{CORE_ICONS.Dollar("w-8 h-8")}</div>
            <div className="flex flex-col">
                <h4 className={`text-2xl font-dm font-bold text-[#cfcece] leading-none mb-1`}>
                    ${stats.revenueMonth.toLocaleString()}
                    <span className="text-xl font-bold text-[#cfcece] ml-2">this month</span>
                </h4>
                <p className="font-medium text-[#cfcece]" style={{ fontSize: '0.875rem' }}>
                    ${stats.revenueYear.toLocaleString()}
                    <span className="text-[#cfcece] ml-1">this year</span>
                </p>
            </div>
        </div>
      </div>

      <div className="flex bg-[#141211] border border-stone-800/60 p-2 rounded-xl w-fit mb-12">
        {[
          { id: 'bookings', label: 'Bookings', icon: CORE_ICONS.Bookings("w-4 h-4") },
          { id: 'calendar', label: 'Calendar', icon: CORE_ICONS.Calendar("w-4 h-4") },
          { id: 'apartments', label: 'Units', icon: CORE_ICONS.Building("w-4 h-4") }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-8 py-4 rounded-lg text-base font-medium transition-all flex items-center space-x-3 ${activeTab === tab.id ? 'bg-stone-800 text-white shadow-lg' : 'text-[#cfcece] hover:text-white'}`}
          >
            <div style={{ color: activeTab === tab.id ? 'white' : EMERALD_ACCENT }}>{tab.icon}</div>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'bookings' && (
        <div className="space-y-12">
          <div className="flex space-x-3 mb-8 px-2">
            {[
                { label: 'All', value: 'all' },
                { label: 'Pending', value: BookingStatus.REQUESTED },
                { label: 'Confirmed', value: BookingStatus.CONFIRMED },
                { label: 'Paid', value: BookingStatus.PAID },
            ].map(filter => (
                <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value as any)}
                    className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                        statusFilter === filter.value
                            ? 'bg-coral-500 text-white shadow-md shadow-coral-500/20'
                            : 'bg-stone-900 border border-stone-800 text-[#cfcece] hover:text-white'
                    }`}
                >
                    {filter.label}
                </button>
            ))}
          </div>

          {groupedAndSortedBookings.length > 0 ? (
            groupedAndSortedBookings.map(([aptTitle, bookingsInGroup]) => (
              <div key={aptTitle} className="space-y-6">
                <h3 className="text-2xl font-serif font-bold text-white tracking-tight px-2">{aptTitle}</h3>
                {bookingsInGroup.map(b => {
                  const apt = apartments.find(a => a.id === b.apartmentId);
                  return (
                    <div key={b.id} className="w-full bg-[#1c1a19] rounded-2xl p-3 md:p-4 border-[1px] animate-in slide-in-from-bottom-4" style={{ borderColor: CARD_BORDER }}>
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-2xl font-serif text-white leading-none font-normal">
                            {b.guestEmail.split('@')[0].charAt(0).toUpperCase() + b.guestEmail.split('@')[0].slice(1)}
                          </h3>
                          <span className={`px-4 py-1.5 rounded-full text-[9px] border uppercase tracking-wider ${
                              b.status === BookingStatus.PAID
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                                : b.status === BookingStatus.CONFIRMED 
                                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' 
                                  : b.status === BookingStatus.REJECTED 
                                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                              {b.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-12 gap-y-4"> 
                          <div className="flex items-center space-x-3">
                              <div className="text-coral-500">{CORE_ICONS.Calendar("w-5 h-5")}</div>
                              <span className="text-white font-normal text-base">{formatBookingRange(b.startDate, b.endDate)}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                              <div className="text-stone-500">{CORE_ICONS.Guests("w-5 h-5")}</div>
                              <span className="text-white font-normal text-base">{b.numGuests || 1} guests</span>
                          </div>
                          <div className="flex items-center space-x-3">
                              <div className="text-coral-500">{CORE_ICONS.Dollar("w-5 h-5")}</div>
                              <span className="text-white font-normal text-xl">${b.totalPrice.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6">
                            <div className="flex items-center space-x-6 text-sm font-normal" style={{ color: LABEL_COLOR }}>
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4">{CORE_ICONS.Mail("w-full h-full")}</div>
                                <span>{b.guestEmail}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4">{CORE_ICONS.Phone("w-full h-full")}</div>
                                <span>{b.guestPhone || '+41 79 123 45 67'}</span>
                              </div>
                            </div>
                            <div className="flex space-x-3">
                                {(b.status === BookingStatus.REQUESTED || b.status === BookingStatus.CONFIRMED) && (
                                  <>
                                    {b.status === BookingStatus.REQUESTED && (
                                      <button onClick={() => handleUpdateStatus(b, BookingStatus.CONFIRMED)} className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-medium uppercase tracking-widest hover:bg-stone-200 transition-all active:scale-95">Confirm</button>
                                    )}
                                    <button onClick={() => handleUpdateStatus(b, BookingStatus.REJECTED)} className="border border-rose-700 text-rose-500 px-6 py-2.5 rounded-xl text-[10px] font-medium uppercase tracking-widest hover:bg-rose-700/10 transition-all">Reject</button>
                                  </>
                                )}
                                {b.status === BookingStatus.CONFIRMED && (
                                  <button 
                                    onClick={() => handleUpdateStatus(b, BookingStatus.PAID)} 
                                    className="border border-emerald-500 text-emerald-500 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/10 transition-all active:scale-95"
                                  >
                                    Mark as paid
                                  </button>
                                )}
                            </div>
                        </div>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="py-24 text-center">
              <p className="text-stone-500 font-serif text-xl">No upcoming bookings for your units with the current filter.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-20">
           {apartments.map(apt => (
             <div key={apt.id} className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                <div className="lg:col-span-2 space-y-6">
                   <h3 className="text-3xl font-serif font-bold text-white tracking-tight">{apt.title}</h3>
                   <p className="text-sm font-medium" style={{ color: LABEL_COLOR }}>Manage manual overrides and view occupancy for this unit.</p>
                </div>
                <div className="lg:col-span-3">
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
             <div key={apt.id} className="bg-[#1c1a19] rounded-2xl overflow-hidden shadow-xl group transition-all hover:border-stone-700 flex flex-col border-[1px]" style={{ borderColor: CARD_BORDER }}>
                <img src={apt.photos[0]} className="aspect-video w-full object-cover" alt={apt.title} />
                <div className="p-8">
                   <h4 className="text-xl font-bold text-white mb-2 leading-tight" style={UNIT_TITLE_STYLE}>{apt.title}</h4>
                   <p className="text-[10px] font-bold tracking-widest mb-10" style={{ color: LABEL_COLOR }}>{apt.city}</p>
                   <div className="flex justify-between items-center pt-6 border-t border-stone-800/60">
                      <p className="text-xl font-bold text-coral-500">${apt.pricePerNight}<span className="text-[10px] text-stone-700 ml-2 font-bold">Base</span></p>
                      <button onClick={() => { setEditingApt(apt); setShowAptModal(true); }} className="px-6 py-2 rounded-lg bg-stone-100 text-black text-[10px] font-bold">Configure</button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Email Preview Modal */}
      {previewBooking && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300 overflow-y-auto">
          <div className="w-full max-w-2xl space-y-8 my-12">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-bold">Automatic Notification Sent</h3>
              </div>
              <button onClick={() => setPreviewBooking(null)} className="text-stone-500 hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2} /></svg>
              </button>
            </div>
            
            <p className="text-stone-400 text-center text-sm">Preview of the email dispatched to <span className="text-white font-bold">{previewBooking.booking.guestEmail}</span></p>

            {previewBooking.type === 'confirmation' ? (
              <BookingConfirmationTemplate 
                host={host} 
                booking={previewBooking.booking} 
                apartment={apartments.find(a => a.id === previewBooking.booking.apartmentId)!} 
              />
            ) : (
              <BookingCancellationTemplate 
                host={host} 
                booking={previewBooking.booking} 
                apartment={apartments.find(a => a.id === previewBooking.booking.apartmentId)!} 
              />
            )}

            <button onClick={() => setPreviewBooking(null)} className="w-full py-5 bg-stone-800 text-white font-bold rounded-2xl uppercase text-[10px] tracking-widest hover:bg-stone-700 transition-colors">Close Preview</button>
          </div>
        </div>
      )}

      {/* Unit Edit Modal */}
      {showAptModal && editingApt && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300 overflow-y-auto">
           <div className="bg-[#1c1a19] border border-stone-800/60 w-full max-w-4xl rounded-3xl p-8 md:p-12 shadow-2xl space-y-10 my-12 relative">
              <button onClick={() => { setShowAptModal(false); setEditingApt(null); }} className="absolute top-8 right-8 text-stone-600 hover:text-white transition-colors"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
              <h3 className="text-3xl font-serif font-bold text-white leading-none">{editingApt.id ? 'Unit configuration' : 'New sanctuary unit'}</h3>

              <form onSubmit={handleSaveApartment} className="space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div>
                          <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: LABEL_COLOR }}>Unit Title</label>
                          <input type="text" required value={editingApt.title || ''} onChange={e => setEditingApt({...editingApt, title: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-coral-500 transition-all outline-none" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: LABEL_COLOR }}>Location City</label>
                             <input type="text" required value={editingApt.city || ''} onChange={e => setEditingApt({...editingApt, city: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none" />
                          </div>
                          <div>
                             <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: LABEL_COLOR }}>Base Price /night</label>
                             <input type="number" required value={editingApt.pricePerNight || 0} onChange={e => setEditingApt({...editingApt, pricePerNight: parseInt(e.target.value)})} className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none" />
                          </div>
                       </div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: LABEL_COLOR }}>Description</label>
                       <textarea value={editingApt.description || ''} onChange={e => setEditingApt({...editingApt, description: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-sm text-white h-[120px] resize-none focus:ring-1 focus:ring-coral-500 outline-none" />
                    </div>
                 </div>
                 
                 <div className="flex space-x-4 pt-6 border-t border-stone-800/60">
                    <button type="button" onClick={() => { setShowAptModal(false); setEditingApt(null); }} className="flex-1 font-bold py-5 rounded-full border border-stone-800/60 text-[10px] uppercase tracking-widest hover:text-white transition-colors" style={{ color: LABEL_COLOR }}>Discard</button>
                    <button type="submit" className="flex-1 bg-coral-500 text-white font-bold py-5 rounded-full transition-all text-[10px] uppercase tracking-widest shadow-2xl shadow-coral-500/30 active:scale-95">Save sanctuary</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default HostDashboard;
