import React, { useState, useMemo } from 'react';
import { Apartment, Host, Booking, BlockedDate, BookingStatus } from '../types';
import { sanctumApi } from '../services/api';
import { formatDate } from '../utils/dates';
import HeroCalendar from './HeroCalendar';
import { CORE_ICONS } from '../constants';

interface BookingFormProps {
  apartment: Apartment;
  host: Host;
  airbnbCalendarDates: string[];
  bookings: Booking[];
  blockedDates: BlockedDate[];
  onNewBooking: (booking: Booking) => void;
}

const LABEL_COLOR = 'rgb(214,213,213)';

const countries = [ 'USA', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Australia', 'Japan', 'China', 'Brazil', 'India' ];

const BookingForm: React.FC<BookingFormProps> = ({ apartment, host, airbnbCalendarDates, bookings, blockedDates, onNewBooking }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [guestCountry, setGuestCountry] = useState('');
  const [numGuests, setNumGuests] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

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

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!/^[a-zA-Z\s]*$/.test(name)) {
      errors.name = 'Name should only contain letters and spaces.';
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (phone && !/^(\+\d{1,3}[- ]?)?\d{10}$/.test(phone)) {
      errors.phone = 'Please enter a valid phone number.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isBooking) return;

    setIsBooking(true);

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
      const newConfirmedBooking = await sanctumApi.createBooking(bookingDetails);

      onNewBooking(newConfirmedBooking);

    } catch (error) {
      console.error("Failed to create booking:", error);
    } finally {
      setIsBooking(false);
    }
  };

  return (
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
            className="w-full bg-stone-950 border border-stone-600 rounded-2xl py-5 px-6 text-sm font-medium text-white focus:ring-1 focus:ring-coral-500 transition-all outline-none placeholder:text-stone-700"
          />
          {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
        </div>

        <div className="space-y-2 relative">
          <label className="block text-sm font-medium ml-1" style={{ color: LABEL_COLOR }}>Stay availability</label>
          <button
            type="button"
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className={`w-full bg-stone-950 border rounded-2xl py-5 px-6 text-sm font-medium transition-all flex items-center justify-between group ${isCalendarOpen ? 'border-coral-500' : 'border-stone-600'}`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCalendarOpen ? 'bg-coral-500 text-white' : 'bg-stone-600 text-emerald-400'}`}>
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
          <div className="flex items-center justify-between p-4 bg-stone-900 border border-stone-600 rounded-2xl">
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
              className="w-full bg-stone-950 border border-stone-600 rounded-2xl py-5 px-6 text-sm font-medium text-white focus:ring-1 focus:ring-coral-500 outline-none placeholder:text-stone-700"
            />
            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium ml-1" style={{ color: LABEL_COLOR }}>Country</label>
            <select
              required value={guestCountry} onChange={e => setGuestCountry(e.target.value)}
              className="w-full bg-stone-950 border border-stone-600 rounded-2xl py-5 px-6 text-sm font-medium text-white focus:ring-1 focus:ring-coral-500 outline-none placeholder:text-stone-700"
            >
              <option value="">Select a country</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium ml-1" style={{ color: LABEL_COLOR }}>Contact phone (optional)</label>
            <input
              type="tel" placeholder="e.g., +1 555 123 4567" value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full bg-stone-950 border border-stone-600 rounded-2xl py-5 px-6 text-sm font-medium text-white focus:ring-1 focus:ring-coral-500 outline-none placeholder:text-stone-700"
            />
            {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium ml-1" style={{ color: LABEL_COLOR }}>Your message to the host (optional)</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full bg-stone-950 border border-stone-600 rounded-2xl py-5 px-6 text-sm font-medium text-white focus:ring-1 focus:ring-coral-500 outline-none placeholder:text-stone-700 h-[100px] resize-y"
            placeholder="Any special requests or questions?"
          ></textarea>
        </div>

        <button
          disabled={!name || !email || !startDate || !endDate || isBooking}
          className="w-full bg-coral-500 hover:bg-coral-600 disabled:bg-stone-800 disabled:text-stone-600 disabled:cursor-not-allowed text-white font-black py-7 rounded-full transition-all text-[12px] tracking-[0.3em] uppercase mt-8 shadow-2xl shadow-coral-500/30 active:scale-[0.98]"
        >
          {isBooking ? 'Booking...' : 'Book now'}
        </button>
        <p className="text-[10px] text-center font-medium uppercase tracking-widest mt-6" style={{ color: LABEL_COLOR }}>Book with instant confirmation</p>
      </form>
    </div>
  );
};

export default BookingForm;
