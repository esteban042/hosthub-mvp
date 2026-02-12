
import React, { useMemo } from 'react';
import { Host, Apartment, Booking, SubscriptionType, BookingStatus } from '../../types';
import { CreditCard, Percent, Globe, Layers } from 'lucide-react';

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
      <div className="bg-[#1c1a19] p-8 rounded-[2rem] border border-stone-600 shadow-xl flex items-center space-x-5">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
          <CreditCard className="w-6 h-6" />
        </div>
        <div>
        <h4 className="text-2xl font-black text-white leading-none">${stats.monthlySubscription.toLocaleString()}</h4>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-[rgb(214,213,213)] "> Subscription Revenue</p>

        </div>
        </div>
      <div className="bg-[#1c1a19] p-8 rounded-[2rem] border border-stone-600 shadow-xl flex items-center space-x-5">
        <div className="w-12 h-12 bg-coral-500/10 rounded-2xl flex items-center justify-center text-coral-500">
          <Percent className="w-6 h-6" />
        </div> 
        <div>
          <h4 className="text-2xl font-black text-white leading-none">${Math.round(stats.totalCommission).toLocaleString()}</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-[rgb(214,213,213)] ">Platform Commission</p>
        </div>
      </div>
      <div className="bg-[#1c1a19] p-8 rounded-[2rem] border border-stone-600 shadow-xl flex items-center space-x-5">
        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
          <Globe className="w-6 h-6" />
        </div>
        <div>
        <h4 className="text-2xl font-black text-white leading-none">{stats.activeHosts}</h4>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-[rgb(214,213,213)] ">Active Hosts</p>
     
        </div>
       </div>
      <div className="bg-[#1c1a19] p-8 rounded-[2rem] border border-stone-600 shadow-xl flex items-center space-x-5">
        <div className="w-12 h-12 bg-stone-100/10 rounded-2xl flex items-center justify-center text-stone-300">
          <Layers className="w-6 h-6" />
        </div>
        <div>
        <h4 className="text-2xl font-black text-white leading-none">{stats.totalAssets}</h4>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-[rgb(214,213,213)] ">Asset Onlline</p>

        </div>
       </div>
    </div>
  );
};

export default AdminStats;
