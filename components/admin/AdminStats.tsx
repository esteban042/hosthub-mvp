
import React, { useMemo } from 'react';
import { Host, Apartment, Booking, SubscriptionType, BookingStatus } from '../../types';
import { CreditCard, Percent, Globe, Layers } from 'lucide-react';
import { SKY_ACCENT, TEXT_COLOR } from '../../constants';

interface AdminStatsProps {
  hosts: Host[];
  apartments: Apartment[];
  bookings: Booking[];
}

const SUBSCRIPTION_PRICES = {
  [SubscriptionType.BASIC]: 20,
  [SubscriptionType.PRO]: 50,
  [SubscriptionType.ENTERPRISE]: 100
};

const AdminStats: React.FC<AdminStatsProps> = ({ hosts, apartments, bookings }) => {
  const stats = useMemo(() => {
    const subRev = hosts.reduce((acc, h) => acc + (SUBSCRIPTION_PRICES[h.subscriptionType] || 0), 0);
    const totalCommission = hosts.reduce((acc, h) => {
      const hostApts = apartments.filter(a => a.hostId === h.id && a.isActive).map(a => a.id);
      const hostVolume = bookings
        .filter(b => hostApts.includes(b.apartmentId) && (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID))
        .reduce((sum, b) => sum + b.totalPrice, 0);
      return acc + (hostVolume * (h.commissionRate / 100));
    }, 0);
    return { 
      monthlySubscription: subRev, 
      totalCommission, 
      activeHosts: hosts.length, 
      totalAssets: apartments.filter(a => a.isActive).length
    };
  }, [hosts, apartments, bookings]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      <div className="bg-white/50 p-8 rounded-[2rem] border border-gray-700 shadow-xl flex items-center space-x-5">
        <div className="w-12 h-12 bg-sky-accent/10 rounded-2xl flex items-center justify-center" style={{ color: SKY_ACCENT }}>
          <CreditCard className="w-6 h-6" />
        </div>
        <div>
        <h4 className="text-2xl font-black leading-none" style={{ color: TEXT_COLOR }}>${stats.monthlySubscription.toLocaleString()}</h4>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-stone-500"> Subscription Revenue</p>

        </div>
        </div>
      <div className="bg-zinc-100 p-8 rounded-[2rem] border border-gray-800 shadow-xl flex items-center space-x-5">
        <div className="w-12 h-12 bg-sky-accent/10 rounded-2xl flex items-center justify-center" style={{ color: SKY_ACCENT }}>
          <Percent className="w-6 h-6" />
        </div> 
        <div>
          <h4 className="text-2xl font-black leading-none" style={{ color: TEXT_COLOR }}>${Math.round(stats.totalCommission).toLocaleString()}</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-stone-500">Platform Commission</p>
        </div>
      </div>
      <div className="bg-zinc-100 p-8 rounded-[2rem] border border-stone-200 shadow-xl flex items-center space-x-5">
        <div className="w-12 h-12 bg-sky-accent/10 rounded-2xl flex items-center justify-center" style={{ color: SKY_ACCENT }}>
          <Globe className="w-6 h-6" />
        </div>
        <div>
        <h4 className="text-2xl font-black leading-none" style={{ color: TEXT_COLOR }}>{stats.activeHosts}</h4>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-stone-500">Active Hosts</p>
     
        </div>
       </div>
      <div className="bg-white/50 p-8 rounded-[2rem] border border-stone-200 shadow-xl flex items-center space-x-5">
        <div className="w-12 h-12 bg-sky-accent/10 rounded-2xl flex items-center justify-center" style={{ color: SKY_ACCENT }}>
          <Layers className="w-6 h-6" />
        </div>
        <div>
        <h4 className="text-2xl font-black leading-none" style={{ color: TEXT_COLOR }}>{stats.totalAssets}</h4>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-stone-500">Asset Online</p>

        </div>
       </div>
    </div>
  );
};

export default AdminStats;
