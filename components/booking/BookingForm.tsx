import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Apartment, Host, Booking, BlockedDate } from '../../types.js';
import { formatDate } from '../../utils/dates.js';
import HeroCalendar from '../HeroCalendar.tsx';
import { CORE_ICONS, COUNTRIES } from '../../constants.tsx';
import Modal from '../Modal.js';
import { useBookApartment } from '../../hooks/useBookApartment.js';
import { getStripeFixedFee, getCurrency, STRIPE_COMMISSION_RATE } from '../../utils/currencies.js';
import BookingPriceBreakdown from './BookingPriceBreakdown.js';

interface BookingFormProps {
  apartment: Apartment;
  host: Host;
  airbnbCalendarDates: string[];
  bookings: Booking[];
  blockedDates: BlockedDate[];
  onNewBooking: (booking: Booking) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ apartment, host, airbnbCalendarDates, bookings, blockedDates, onNewBooking }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [guestCountry, setGuestCountry] = useState('');
  const [numGuests, setNumGuests] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const { bookApartment, isLoading, error: bookError } = useBookApartment();

  useEffect(() => {
    if (bookError) {
      setModalContent({ title: t('booking_form.booking_failed'), message: bookError });
      setIsModalOpen(true);
    }
  }, [bookError, t]);

  const { finalPrice, currency, nights, serviceFee, basePrice } = useMemo(() => {
    const hostCurrency = getCurrency(host.currency?.code) || { code: 'usd', symbol: '$' };
    const defaultReturn = {
        finalPrice: apartment.pricePerNight || 0,
        currency: hostCurrency,
        nights: 0,
        serviceFee: 0,
        basePrice: apartment.pricePerNight || 0,
    };

    if (!startDate || !endDate) {
        return defaultReturn;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const nightsCalc = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24));

    if (nightsCalc <= 0) {
        return defaultReturn;
    }
    
    let total = 0;
    let current = new Date(start);

    while (current.toISOString().split('T')[0] < end.toISOString().split('T')[0]) {
        const dateStr = current.toISOString().split('T')[0];
        const override = apartment.priceOverrides?.find(rule => dateStr >= rule.startDate && dateStr <= rule.endDate);
        total += override ? override.price : (apartment.pricePerNight || 0);
        current.setDate(current.getDate() + 1);
    }

    const hostNetTotal = total;
    let calculatedFinalPrice = hostNetTotal;
    let calculatedServiceFee = 0;

    if (host.stripeAccountId && host.commissionRate > 0) {
        const platformCommissionRate = host.commissionRate / 100;
        const stripeCommissionRate = STRIPE_COMMISSION_RATE;
        const stripeFixedFee = getStripeFixedFee(hostCurrency.code);

        const unroundedFinalPrice = (hostNetTotal + stripeFixedFee) / (1 - platformCommissionRate - stripeCommissionRate);
        calculatedFinalPrice = Math.ceil(unroundedFinalPrice / 10) * 10;
        calculatedServiceFee = calculatedFinalPrice - hostNetTotal;
    }

    return {
        finalPrice: calculatedFinalPrice,
        currency: hostCurrency,
        nights: nightsCalc,
        serviceFee: calculatedServiceFee,
        basePrice: hostNetTotal,
    };
  }, [startDate, endDate, apartment, host]);

  useEffect(() => {
    if (startDate && endDate) {
      const nights = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24);
      if (apartment.minStayNights && nights < apartment.minStayNights) {
        setModalContent({
          title: t('booking_form.min_stay_requirement'),
          message: t('booking_form.min_stay_message', { count: apartment.minStayNights })
        });
        setIsModalOpen(true);
        setStartDate('');
        setEndDate('');
      } else if (apartment.maxStayNights && nights > apartment.maxStayNights) {
        setModalContent({
          title: t('booking_form.max_stay_exceeded'),
          message: t('booking_form.max_stay_message', { count: apartment.maxStayNights })
        });
        setIsModalOpen(true);
        setStartDate('');
        setEndDate('');
      }
    }
  }, [startDate, endDate, apartment, t]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!name.trim()) {
      errors.name = t('booking_form.validation.name_required');
    } else if (!/^[a-zA-Z\s]*$/.test(name)) {
      errors.name = t('booking_form.validation.name_invalid');
    }

    if (!email.trim()) {
      errors.email = t('booking_form.validation.email_required');
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = t('booking_form.validation.email_invalid');
    }

    if (phone && !/^(\+\d{1,3}[- ]?)?\d{10}$/.test(phone)) {
      errors.phone = t('booking_form.validation.phone_invalid');
    }
    
    if (!startDate || !endDate) {
      errors.dates = t('booking_form.validation.dates_required');
    }
    
    if (!guestCountry) {
      errors.guestCountry = t('booking_form.validation.country_required');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isLoading) return;

    const bookingDetails = {
      apartmentId: apartment.id,
      guestName: name,
      guestEmail: email,
      guestCountry: guestCountry,
      numGuests: numGuests,
      startDate: startDate,
      endDate: endDate,
      guestMessage: message,
      guestPhone: phone,
    };

    const newBooking = await bookApartment(bookingDetails);

    if (newBooking) {
        onNewBooking(newBooking);
        if (newBooking.stripeSessionUrl) {
            window.location.href = newBooking.stripeSessionUrl;
        } else {
          setModalContent({ 
            title: t('booking_form.booking_request_sent'), 
            message: t('booking_form.booking_request_sent_message') 
          });
          setIsModalOpen(true);
        }
    }
  };
  
  const isStripeBooking = !!host.stripeAccountId;

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
      >
        <p>{modalContent.message}</p>
      </Modal>
      <div className="bg-alabaster/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-stone-200 shadow-2xl max-w-3xl mx-auto">
        <div className="flex items-baseline justify-between mb-10 pb-10 border-b border-stone-200/40">
          <div>
            <span className="text-[11px] font-medium text-charcoal uppercase tracking-[0.2em] block mb-2">{nights > 0 ? t('booking_form.total_price') : t('booking_form.price_per_night')}</span>
            <span className="text-5xl font-black text-charcoal">{currency.symbol}{finalPrice.toLocaleString()}</span>
          </div>
        </div>

        {nights > 0 && (
          <BookingPriceBreakdown
            pricePerNight={basePrice / nights}
            nights={nights}
            serviceFee={serviceFee}
            totalPrice={finalPrice}
          />
        )}

        <form noValidate onSubmit={handleBooking} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm text-charcoal font-medium ml-1">{t('booking_form.guest_name_label')}</label>
            <input
              type="text" required placeholder={t('booking_form.guest_name_placeholder')} value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-white/50 border border-stone-300 rounded-2xl py-5 px-6 text-sm font-medium text-charcoal focus:ring-1 focus:ring-sky-accent transition-all outline-none placeholder:text-charcoal/50"
            />
            {formErrors.name && <p className="text-rose-500 text-xs mt-1 ml-1">{formErrors.name}</p>}
          </div>

          <div className="space-y-2 relative">
            <label className="block text-sm font-medium ml-1 text-charcoal">{t('booking_form.dates_label')}</label>
            <button
              type="button"
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className={`w-full bg-white/50 border rounded-2xl py-5 px-6 text-sm font-medium transition-all flex items-center justify-between group ${isCalendarOpen || formErrors.dates ? 'border-rose-500' : 'border-stone-300'}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCalendarOpen ? 'bg-sky-accent text-white' : 'bg-stone-200 text-sky-accent'}`}>
                  {CORE_ICONS.Calendar("w-4 h-4")}
                </div>
                <span className={startDate ? 'text-charcoal' : 'text-charcoal/50'}>
                  {startDate ? `${formatDate(startDate)} — ${formatDate(endDate) || '...'}` : t('booking_form.dates_placeholder')}
                </span>
              </div>
            </button>
            {formErrors.dates && <p className="text-rose-500 text-xs mt-1 ml-1">{formErrors.dates}</p>}
            {isCalendarOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-[calc(100%+2rem)] z-[100] mt-4 bg-white p-4 rounded-3xl shadow-2xl border border-stone-200">
                <HeroCalendar
                  apartment={apartment}
                  currency={currency}
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
            <label className="block text-sm font-medium ml-1">{t('booking_form.num_guests_label')}</label>
            <div className="flex items-center justify-between p-4 bg-white/50 border border-stone-300 rounded-2xl">
              <button
                type="button"
                onClick={() => setNumGuests(prev => Math.max(1, prev - 1))}
                className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center text-charcoal hover:border-sky-accent transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M20 12H4" /></svg>
              </button>
              <span className="text-ml font-black text-charcoal">{numGuests}</span>
              <button
                type="button"
                onClick={() => setNumGuests(prev => Math.min(apartment.capacity || 10, prev + 1))}
                className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center text-charcoal hover:border-sky-accent transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium ml-1 text-charcoal">{t('booking_form.contact_email_label')}</label>
              <input
                type="email" required placeholder={t('booking_form.contact_email_placeholder')} value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/50 border border-stone-300 rounded-2xl py-5 px-6 text-sm font-medium text-charcoal focus:ring-1 focus:ring-sky-accent outline-none placeholder:text-charcoal/50"
              />
              {formErrors.email && <p className="text-rose-500 text-xs mt-1 ml-1">{formErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium ml-1 text-charcoal">{t('booking_form.country_label')}</label>
              <select
                required value={guestCountry} onChange={e => setGuestCountry(e.target.value)}
                className="w-full bg-white/50 border border-stone-300 rounded-2xl py-5 px-6 text-sm font-medium text-charcoal focus:ring-1 focus:ring-sky-accent outline-none placeholder:text-charcoal/50 appearance-none"
              >
                <option value="">{t('booking_form.country_placeholder')}</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {formErrors.guestCountry && <p className="text-rose-500 text-xs mt-1 ml-1">{formErrors.guestCountry}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium ml-1 text-charcoal">{t('booking_form.contact_phone_label')}</label>
              <input
                type="tel" placeholder={t('booking_form.contact_phone_placeholder')} value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full bg-white/50 border border-stone-300 rounded-2xl py-5 px-6 text-sm font-medium text-charcoal focus:ring-1 focus:ring-sky-accent outline-none placeholder:text-charcoal/50"
              />
              {formErrors.phone && <p className="text-rose-500 text-xs mt-1 ml-1">{formErrors.phone}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium ml-1 text-charcoal">{t('booking_form.message_label')}</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full bg-white/50 border border-stone-300 rounded-2xl py-5 px-6 text-sm font-medium text-charcoal focus:ring-1 focus:ring-sky-accent outline-none placeholder:text-charcoal/50 h-[100px] resize-y"
              placeholder={t('booking_form.message_placeholder')}
            ></textarea>
          </div>

          <button
            disabled={isLoading}
            className="w-full bg-sky-700/80 text-white disabled:bg-alabaster/70 disabled:text-stone-400 disabled:cursor-not-allowed py-7 rounded-full transition-all text-[12px] tracking-[0.3em] uppercase mt-8 shadow-2xl shadow-sky-700/30 active:scale-[0.98]"
          >
            {isLoading ? t('booking_form.processing_button') : (isStripeBooking ? t('booking_form.book_and_pay_button') : t('booking_form.book_now_button'))}
          </button>
          <p className="text-[10px] text-center font-medium uppercase tracking-widest mt-6 text-charcoal">
            {isStripeBooking ? t('booking_form.secure_booking_message') : t('booking_form.instant_confirmation_message')}
          </p>
        </form>
      </div>
    </>
  );
};

export default BookingForm;
