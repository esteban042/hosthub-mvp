import React, { useState, useMemo } from 'react';
import { Host, Apartment, Booking, UserRole, SubscriptionType, BookingStatus } from '../types';

interface AdminDashboardProps {
  hosts: Host[];
  apartments: Apartment[];
  bookings: Booking[];
  onUpdateHosts: (hosts: Host[]) => void;
}

const THEME_GRAY = 'hsl(30 5% 55%)';

const SUBSCRIPTION_PRICES = {
  [SubscriptionType.STANDARD]: 49,
  [SubscriptionType.PREMIUM]: 149
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  hosts, 
  apartments, 
  bookings,
  onUpdateHosts
}) => {
  const [showAddHost, setShowAddHost] = useState(false);
  const [newHost, setNewHost] = useState({ 
    name: '', 
    slug: '', 
    bio: '', 
    subscriptionType: SubscriptionType.STANDARD,
    commissionRate: 3
  });

  const stats = useMemo(() => {
    const subRev = hosts.reduce((acc, h) => acc + SUBSCRIPTION_PRICES[h.subscriptionType], 0);
    
    const commissionRev = hosts.reduce((acc, h) => {
      const hostApts = apartments.filter(a => a.hostId === h.id).map(a => a.id);
      const hostConfirmedBookings = bookings.filter(b => hostApts.includes(b.apartmentId) && b.status === BookingStatus.CONFIRMED);
      const hostVolume = hostConfirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      return acc + (hostVolume * (h.commissionRate / 100));
    }, 0);

    return {
      monthlySubscription: subRev,
      totalCommission: commissionRev,
      activeHosts: hosts.length,
      totalAssets: apartments.length
    };
  }, [hosts, apartments, bookings]);

  const handleUpdateHostProperty = (hostId: string, updates: Partial<Host>) => {
    onUpdateHosts(hosts.map(h => h.id === hostId ? { ...h, ...updates } : h));
  };

  const handleAddHost = (e: React.FormEvent) => {
    e.preventDefault();
    const host: Host = {
      id: `host-${Math.random().toString(36).substr(2, 9)}`,
      slug: newHost.slug.toLowerCase().replace(/\s+/g, '-'),
      name: newHost.name,
      bio: newHost.bio,
      avatar: `https://picsum.photos/seed/${newHost.slug}/200/200`,
      subscriptionType: newHost.subscriptionType,
      commissionRate: newHost.commissionRate
    };
    onUpdateHosts([...hosts, host]);
    setShowAddHost(false);
    setNewHost({ name: '', slug: '', bio: '', subscriptionType: SubscriptionType.STANDARD, commissionRate: 3 });
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 animate-in fade-in duration-1000 font-dm">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-2">
          <p className="text-coral-500 font-bold uppercase tracking-[0.3em] text-[10px]">Platform hq</p>
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-white">Global administration</h1>
        </div>
        <button 
          onClick={() => setShowAddHost(true)}
          className="bg-stone-100 hover:bg-white text-stone-950 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-stone-500/10 active:scale-95 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          <span>Onboard elite host</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="bg-stone-900/30 border border-stone-800/60 p-8 rounded-[1.5rem]">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: THEME_GRAY }}>Sub. revenue / mo</p>
          <h4 className="text-3xl font-bold text-white">${stats.monthlySubscription.toLocaleString()}</h4>
          <div className="mt-4 flex items-center text-[9px] font-bold uppercase tracking-tighter text-stone-600">
            <span className="text-coral-500">Fixed tier yield</span>
          </div>
        </div>
        <div className="bg-stone-900/30 border border-stone-800/60 p-8 rounded-[1.5rem]">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: THEME_GRAY }}>Total commissions</p>
          <h4 className="text-3xl font-bold text-coral-500">${stats.totalCommission.toLocaleString()}</h4>
          <div className="mt-4 flex items-center text-[9px] font-bold uppercase tracking-tighter text-stone-600">
            <span>Aggregated 3-5% cut</span>
          </div>
        </div>
        <div className="bg-stone-900/30 border border-stone-800/60 p-8 rounded-[1.5rem]">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: THEME_GRAY }}>Active assets</p>
          <h4 className="text-3xl font-bold text-white">{stats.totalAssets}</h4>
          <div className="mt-4 flex items-center text-[9px] font-bold uppercase tracking-tighter text-stone-600">
            <span>Managed luxury units</span>
          </div>
        </div>
        <div className="bg-stone-900/30 border border-stone-800/60 p-8 rounded-[1.5rem]">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: THEME_GRAY }}>Enterprise hosts</p>
          <h4 className="text-3xl font-bold text-white">{stats.activeHosts}</h4>
          <div className="mt-4 flex items-center text-[9px] font-bold uppercase tracking-tighter text-stone-600">
            <span>Multi-tenant accounts</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-serif text-white px-2">Ecosystem management</h3>
        <div className="bg-stone-900/20 border border-stone-800/60 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-900/60 border-b border-stone-800 text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Host identity</th>
                <th className="px-8 py-6">Status / tier</th>
                <th className="px-8 py-6">Performance</th>
                <th className="px-8 py-6">Commission</th>
                <th className="px-8 py-6 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/40">
              {hosts.map(h => {
                const hostApts = apartments.filter(a => a.hostId === h.id).map(a => a.id);
                const hostBookings = bookings.filter(b => hostApts.includes(b.apartmentId) && b.status === BookingStatus.CONFIRMED);
                const volume = hostBookings.reduce((sum, b) => sum + b.totalPrice, 0);
                const commission = volume * (h.commissionRate / 100);

                return (
                  <tr key={h.id} className="hover:bg-stone-800/20 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <img src={h.avatar} className="w-12 h-12 rounded-xl object-cover border border-stone-800 shadow-lg" alt={h.name} />
                        <div>
                          <p className="font-serif font-bold text-white text-lg leading-none mb-1">{h.name}</p>
                          <p className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">{h.slug}.wanderlust.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <select 
                        value={h.subscriptionType} 
                        onChange={(e) => handleUpdateHostProperty(h.id, { subscriptionType: e.target.value as SubscriptionType })}
                        className={`bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest outline-none cursor-pointer transition-colors ${h.subscriptionType === SubscriptionType.PREMIUM ? 'text-coral-500 border-coral-500/30' : 'text-stone-400'}`}
                      >
                        <option value={SubscriptionType.STANDARD}>Standard tier</option>
                        <option value={SubscriptionType.PREMIUM}>Premium tier</option>
                      </select>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-white font-bold text-sm">${volume.toLocaleString()}</p>
                        <p className="text-[9px] font-bold text-stone-600 uppercase tracking-widest">{hostBookings.length} Bookings</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="space-y-1">
                          <p className="text-coral-500 font-bold text-sm">${commission.toLocaleString()}</p>
                          <select 
                            value={h.commissionRate}
                            onChange={(e) => handleUpdateHostProperty(h.id, { commissionRate: parseInt(e.target.value) })}
                            className="bg-transparent text-[9px] font-bold text-stone-600 uppercase tracking-widest outline-none cursor-pointer hover:text-stone-400"
                          >
                            <option value={3}>3% rate</option>
                            <option value={4}>4% rate</option>
                            <option value={5}>5% rate</option>
                          </select>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-stone-500 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {hosts.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-stone-500 font-serif text-xl">No hosts registered on the platform.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
