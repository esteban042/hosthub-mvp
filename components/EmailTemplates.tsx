import React from 'react';
import { Host, Apartment, Booking, BookingStatus } from '../types';
import { formatDate } from '../pages/GuestLandingPage';

interface TemplateProps {
  host: Host;
  apartment: Apartment;
  booking: Booking;
}

const containerStyle: React.CSSProperties = {
  backgroundColor: '#f9fafb', // A very light, neutral gray (Tailwind's gray-50)
  padding: '2rem',
  fontFamily: 'sans-serif',
};

export const BookingConfirmationTemplate: React.FC<TemplateProps> = ({ host, apartment, booking }) => {
  const deposit = booking.totalPrice * 0.25; // Default 25% deposit
  
  return (
    <div style={containerStyle}>
      <div className="bg-stone-900 p-8 rounded-[2rem] border border-stone-800 font-sans max-w-xl mx-auto overflow-hidden">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-serif font-bold text-white mb-2 tracking-tight">Booking Confirmed</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Booking ID: {booking.id}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
        </div>

        <div className="space-y-6 mb-10">
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-stone-800">
            <img src={apartment.photos[0]} className="w-full h-full object-cover" alt={apartment.title} />
          </div>
          
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-stone-500">The Sanctuary</p>
            <h2 className="text-xl font-bold text-white">{apartment.title}</h2>
            <p className="text-sm text-stone-400">{apartment.city}, {host.country}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 py-6 border-y border-stone-800/40">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-stone-500">Guest Name</p>
              <p className="text-white font-medium">{booking.guestName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-stone-500">Check-In</p>
              <p className="text-white font-medium">{formatDate(booking.startDate)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-stone-500">Check-Out</p>
              <p className="text-white font-medium">{formatDate(booking.endDate)}</p>
            </div>
          </div>
        </div>

        <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-stone-400">Total Stay</span>
            <span className="text-lg font-bold text-white">${booking.totalPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-stone-800/60">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-coral-500">Required Deposit (25%)</span>
              <span className="text-[9px] text-stone-500 mt-1 italic">DUE UPON RECEIPT</span>
            </div>
            <span className="text-2xl font-black text-coral-500">${deposit.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white">Payment Instructions</h3>
          <p className="text-sm text-stone-400 leading-relaxed bg-stone-800/30 p-4 rounded-xl border border-stone-800/40 italic">
            {host.paymentInstructions || "Please contact your host via the HostHub platform to arrange payment of the deposit. Bookings are held for 24 hours pending deposit receipt."}
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800/40 text-center">
          <p className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.2em] mb-4">Managed by HostHub Pro</p>
          <div className="flex items-center justify-center space-x-3">
            <img src={host.avatar} className="w-6 h-6 rounded-full grayscale" alt={host.name} />
            <span className="text-xs text-stone-500">Your host, {host.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BookingCancellationTemplate: React.FC<TemplateProps> = ({ host, apartment, booking }) => {
  return (
    <div style={containerStyle}>
      <div className="bg-stone-900 p-8 rounded-[2rem] border border-stone-800 font-sans max-w-xl mx-auto overflow-hidden">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-serif font-bold text-white mb-2 tracking-tight">Stay Cancelled</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Status: Unsuccessful</p>
          </div>
          <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20">
            <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
        </div>

        <p className="text-lg text-stone-400 leading-relaxed mb-10 font-medium">
          We regret to inform you that your request for <span className="text-white font-bold">{apartment.title}</span> could not be fulfilled for the selected dates.
        </p>

        <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 mb-8 opacity-60 line-through grayscale">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-stone-500">Guest Name</p>
              <p className="text-white font-medium">{booking.guestName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-stone-500">Check-In</p>
              <p className="text-white font-medium">{formatDate(booking.startDate)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-stone-500">Check-Out</p>
              <p className="text-white font-medium">{formatDate(booking.endDate)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-sm text-stone-400">
            If you have already paid a deposit, it will be refunded to your original payment method within 3-5 business days. Please explore other available sanctuaries in {apartment.city}.
          </p>
          <button className="w-full bg-stone-800 hover:bg-stone-700 text-white font-bold py-4 rounded-xl text-[10px] uppercase tracking-widest transition-all">Explore Alternatives</button>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800/40 text-center text-stone-600">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">HostHub Property Network</p>
        </div>
      </div>
    </div>
  );
};

export const BookingRequestReceivedTemplate: React.FC<TemplateProps> = ({ host, apartment, booking }) => {
  return (
    <div style={containerStyle}>
      <div className="bg-stone-900 p-8 rounded-[2rem] border border-stone-800 font-sans max-w-xl mx-auto overflow-hidden">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-serif font-bold text-white mb-2 tracking-tight">Booking Request Received</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Request ID: {booking.id}</p>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>

        <p className="text-lg text-stone-400 leading-relaxed mb-10 font-medium">
          Thank you for your interest in <span className="text-white font-bold">{apartment.title}</span>! We've received your booking request for the following dates and are awaiting review from {host.name}.
        </p>

        <div className="space-y-6 mb-10">
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-stone-800">
            <img src={apartment.photos[0]} className="w-full h-full object-cover" alt={apartment.title} />
          </div>
          
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-stone-500">The Sanctuary</p>
            <h2 className="text-xl font-bold text-white">{apartment.title}</h2>
            <p className="text-sm text-stone-400">{apartment.city}, {host.country}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 py-6 border-y border-stone-800/40">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-stone-500">Guest Name</p>
              <p className="text-white font-medium">{booking.guestName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-stone-500">Check-In</p>
              <p className="text-white font-medium">{formatDate(booking.startDate)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-stone-500">Check-Out</p>
              <p className="text-white font-medium">{formatDate(booking.endDate)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white">Next Steps</h3>
          <p className="text-sm text-stone-400 leading-relaxed bg-stone-800/30 p-4 rounded-xl border border-stone-800/40 italic">
            {host.name} will review your request shortly. You will receive another email once your booking is confirmed or if any further information is needed.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800/40 text-center">
          <p className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.2em] mb-4">Managed by HostHub Pro</p>
          <div className="flex items-center justify-center space-x-3">
            <img src={host.avatar} className="w-6 h-6 rounded-full grayscale" alt={host.name} />
            <span className="text-xs text-stone-500">Your host, {host.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
