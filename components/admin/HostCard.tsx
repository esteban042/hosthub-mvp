import React, { useState } from 'react';
import { Host, Apartment, Booking, SubscriptionType, BookingStatus } from '../../types';
import { Globe, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import { BACKGROUND_COLOR, TEXT_COLOR } from '../../constants';

interface HostCardProps {
  host: Host;
  apartments: Apartment[];
  bookings: Booking[];
  onConfigure: (host: Host) => void;
}

const HostCard: React.FC<HostCardProps> = ({ host, apartments, bookings, onConfigure }) => {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/?host=${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const hostApts = apartments.filter(a => a.hostId === host.id && a.isActive);
  const activeUrl = `${window.location.origin}/?host=${host.slug}`;
  const isCopied = copiedSlug === host.slug;
  const totalBookings = bookings.filter(b => hostApts.some(a => a.id === b.apartmentId) && (b.status === BookingStatus.PAID || b.status === BookingStatus.CONFIRMED)).length;
  const canceledBookings = bookings.filter(b => hostApts.some(a => a.id === b.apartmentId) && b.status === BookingStatus.CANCELED).length;

  return (
    <div className="bg-alabaster/40 backdrop-blur-3xl border border-stone-200 rounded-[2.5rem] p-8 flex flex-col shadow-2xl group hover:border-emerald-500/40 transition-all">
      <div className="flex justify-between items-start mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-stone-200">
            <img src={host.avatar} className="w-full h-full object-cover" alt={host.name} />
          </div>
          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
            host.subscriptionType === SubscriptionType.ENTERPRISE ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/40' :
            host.subscriptionType === SubscriptionType.PRO ? 'bg-sky-500/10 text-sky-700 border-sky-700/40' :
            'bg-stone-200 text-stone-600 border-stone-300'
          }`}>
            {host.subscriptionType} Tier
          </div>
      </div>

      <div className="mb-8">
        <h4 className="text-2xl font-serif font-bold text-charcoal mb-2">{host.name}</h4>
        <div className="flex items-center justify-between p-3 bg-white/50 border border-stone-300 rounded-xl">
            <p className="text-[10px] text-charcoal/60 font-bold truncate max-w-[160px]">{host.slug}.sanctum.com</p>
            <button 
              onClick={() => handleCopyLink(host.slug)}
              className={`transition-colors ${isCopied ? 'text-emerald-400' : 'text-stone-400 hover:text-charcoal'}`}
            >
              {isCopied ? <ShieldCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 py-6 border-y border-stone-200/60 mb-8">
          <div>
            <p className="text-[9px] font-black uppercase text-charcoal/70 mb-1 tracking-widest">Units</p>
            <p className="text-xl font-black text-charcoal">{hostApts.length}</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-charcoal/70 mb-1 tracking-widest">Commission</p>
            <p className="text-xl font-black text-charcoal">{host.commissionRate}%</p>
          </div>
          <div>
          <p className="text-[9px] font-black uppercase text-charcoal/70  mb-1 tracking-widest">Total</p>
          <p className="text-xl font-black text-charcoal">{totalBookings}</p>
        </div>
          <div>
          <p className="text-[9px] font-black uppercase text-charcoal/70  mb-1 tracking-widest">Canceled</p>
          <p className="text-xl font-black text-charcoal">{canceledBookings}</p>
        </div>

      </div>

      <div className="flex items-center space-x-3 mt-auto">
        <button 
          onClick={() => onConfigure(host)}
          className="flex-1 bg-white/50 border border-stone-300 text-charcoal/80 hover:text-charcoal py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Configure Host
        </button>

      </div>
    </div>
  );
};

export default HostCard;
