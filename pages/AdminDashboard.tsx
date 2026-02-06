import React, { useState, useMemo } from 'react';
import { Host, Apartment, Booking, UserRole, SubscriptionType, BookingStatus, PremiumConfig, PremiumSection } from '../types';
import { CORE_ICONS } from './GuestLandingPage'; // Import CORE_ICONS


interface AdminDashboardProps {
  hosts: Host[];
  apartments: Apartment[];
  bookings: Booking[];
  onUpdateHosts: (hosts: Host[]) => void;
}

const THEME_GRAY = 'hsl(30 5% 55%)';
const LABEL_COLOR = 'rgb(168, 162, 158)';

const SUBSCRIPTION_PRICES = {
  [SubscriptionType.BASIC]: 20,
  [SubscriptionType.PRO]: 50,
  [SubscriptionType.ENTERPRISE]: 100
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  hosts, 
  apartments, 
  bookings,
  onUpdateHosts
}) => {
  const [showHostModal, setShowHostModal] = useState(false);
  const [editingHost, setEditingHost] = useState<Partial<Host> | null>(null);

  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();

    const subRev = hosts.reduce((acc, h) => acc + SUBSCRIPTION_PRICES[h.subscriptionType], 0);
    
    const totalCommissionAllHosts = hosts.reduce((acc, h) => {
      const hostApts = apartments.filter(a => a.hostId === h.id).map(a => a.id);
      const hostConfirmedBookings = bookings.filter(b => 
        hostApts.includes(b.apartmentId) && 
        (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID) &&
        new Date(b.startDate).getFullYear() === currentYear
      );
      const hostVolume = hostConfirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      return acc + (hostVolume * (h.commissionRate / 100));
    }, 0);

    const totalBookingsAllHostsThisYear = bookings.filter(b => 
        (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID) &&
        new Date(b.startDate).getFullYear() === currentYear
    ).length;

    return {
      monthlySubscription: subRev,
      totalCommission: totalCommissionAllHosts,
      activeHosts: hosts.length,
      totalAssets: apartments.length,
      totalBookingsThisYear: totalBookingsAllHostsThisYear // New stat
    };
  }, [hosts, apartments, bookings]);

  const handleUpdateHostProperty = (hostId: string, updates: Partial<Host>) => {
    onUpdateHosts(hosts.map(h => h.id === hostId ? { ...h, ...updates } : h));
  };

  const handleSaveHost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHost) return;

    if (editingHost.id) {
      // Update existing
      onUpdateHosts(hosts.map(h => h.id === editingHost.id ? { ...h, ...editingHost } as Host : h));
    } else {
      // Create new
      const host: Host = {
        id: `host-${Math.random().toString(36).substr(2, 9)}`,
        slug: editingHost.slug?.toLowerCase().replace(/\s+/g, '-') || 'new-host',
        name: editingHost.name || 'New Elite Host',
        bio: editingHost.bio || '',
        avatar: editingHost.avatar || `https://picsum.photos/seed/${editingHost.slug || 'host'}/200/200`,
        subscriptionType: editingHost.subscriptionType || SubscriptionType.BASIC,
        commissionRate: editingHost.commissionRate || 3,
        contactEmail: editingHost.contactEmail || '',
        physicalAddress: editingHost.physicalAddress || '',
        country: editingHost.country || 'USA',
        phoneNumber: editingHost.phoneNumber || '',
        notes: editingHost.notes || '',
        airbnbCalendarLink: editingHost.airbnbCalendarLink || '',
        premiumConfig: editingHost.premiumConfig || { isEnabled: false, images: [], sections: [] }
      };
      onUpdateHosts([...hosts, host]);
    }
    
    setShowHostModal(false);
    setEditingHost(null);
  };

  const updatePremiumConfig = (updates: Partial<PremiumConfig>) => {
    if (!editingHost) return;
    const currentConfig = editingHost.premiumConfig || { isEnabled: false, images: [], sections: [] };
    setEditingHost({
      ...editingHost,
      premiumConfig: { ...currentConfig, ...updates }
    });
  };

  const addPremiumSection = () => {
    const currentSections = editingHost?.premiumConfig?.sections || [];
    updatePremiumConfig({ sections: [...currentSections, { title: '', content: '' }] });
  };

  const updatePremiumSection = (idx: number, updates: Partial<PremiumSection>) => {
    const sections = [...(editingHost?.premiumConfig?.sections || [])];
    sections[idx] = { ...sections[idx], ...updates };
    updatePremiumConfig({ sections });
  };

  const removePremiumSection = (idx: number) => {
    const sections = (editingHost?.premiumConfig?.sections || []).filter((_, i) => i !== idx);
    updatePremiumConfig({ sections });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 animate-in fade-in duration-1000 font-dm">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-2">
          <p className="text-coral-500 font-bold uppercase tracking-[0.3em] text-[10px]">Platform hq</p>
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-white">Global administration</h1>
        </div>
        <button 
          onClick={() => { setEditingHost({}); setShowHostModal(true); }}
          className="bg-transparent border border-[#cfcece] text-[#cfcece] px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-stone-300/10 active:scale-95 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          <span className="capitalize">Onboard host</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="bg-stone-900/30 border border-stone-800/60 p-8 rounded-[1.5rem]">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: THEME_GRAY }}>Sub. revenue / mo</p>
          <h4 className="text-3xl font-bold text-white">${stats.monthlySubscription.toLocaleString()}</h4>
          <div className="mt-4 flex items-center text-xs font-bold uppercase tracking-tighter text-[#cfcece]">
            <span className="text-[#cfcece]">Fixed tier yield</span>
          </div>
        </div>
        <div className="bg-stone-900/30 border border-stone-800/60 p-8 rounded-[1.5rem]">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: THEME_GRAY }}>Total commissions</p>
          <h4 className="text-3xl font-bold text-coral-500">${stats.totalCommission.toLocaleString()}</h4>
          <div className="mt-4 flex items-center text-xs font-bold uppercase tracking-tighter text-[#cfcece]">
            <span>Aggregated 3-6% cut</span>
          </div>
        </div>
        <div className="bg-stone-900/30 border border-stone-800/60 p-8 rounded-[1.5rem]">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: THEME_GRAY }}>Active assets</p>
          <h4 className="text-3xl font-bold text-white">{stats.totalAssets}</h4>
          <div className="mt-4 flex items-center text-xs font-bold uppercase tracking-tighter text-[#cfcece]">
            <span>Managed units</span>
          </div>
        </div>
        <div className="bg-stone-900/30 border border-stone-800/60 p-8 rounded-[1.5rem]">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: THEME_GRAY }}>Total Bookings ({currentYear})</p>
          <h4 className="text-3xl font-bold text-white">{stats.totalBookingsThisYear}</h4>
          <div className="mt-4 flex items-center text-xs font-bold uppercase tracking-tighter text-[#cfcece]">
            <span>Across all active hosts</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-dm text-white px-2">Ecosystem management</h3>
        <div className="bg-stone-900/20 border border-stone-800/60 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-900/60 border-b border-stone-800">
                <th className="px-8 py-6 font-dm text-lg font-bold" style={{ color: LABEL_COLOR }}>Host</th>
                <th className="px-8 py-6 font-dm text-lg font-bold" style={{ color: LABEL_COLOR }}>Bookings ({currentYear})</th>
                <th className="px-8 py-6 font-dm text-lg font-bold" style={{ color: LABEL_COLOR }}>Commission ({currentYear})</th>
                <th className="px-8 py-6 text-right font-dm text-lg font-bold" style={{ color: LABEL_COLOR }}>Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/40">
              {hosts.map(h => {
                const hostApts = apartments.filter(a => a.hostId === h.id).map(a => a.id);
                const hostBookings = bookings.filter(b => hostApts.includes(b.apartmentId) && (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID));
                
                // Calculations for current year
                const hostBookingsThisYear = hostBookings.filter(b => new Date(b.startDate).getFullYear() === currentYear);
                const volumeThisYear = hostBookingsThisYear.reduce((sum, b) => sum + b.totalPrice, 0);
                const commissionThisYear = volumeThisYear * (h.commissionRate / 100);

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
                        <p className="text-xl font-bold text-white">{hostBookingsThisYear.length}</p>
                    </td>
                    <td className="px-8 py-6">
                        <p className="text-xl font-bold text-white">${commissionThisYear.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => { setEditingHost(h); setShowHostModal(true); }} className="p-2 rounded-lg text-stone-600 hover:text-white transition-colors">
                        {CORE_ICONS.Edit("w-5 h-5")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showHostModal && editingHost && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300 overflow-y-auto">
           <div className="bg-[#1c1a19] border border-stone-800/60 w-full max-w-4xl rounded-3xl p-8 md:p-12 shadow-2xl space-y-10 my-12 relative">
              <button onClick={() => { setShowHostModal(false); setEditingHost(null); }} className="absolute top-8 right-8 text-stone-600 hover:text-white transition-colors"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
              <h3 className="text-3xl font-serif font-bold text-white leading-none">{editingHost.id ? 'Edit Host Profile' : 'Onboard New Elite Host'}</h3>

              <form onSubmit={handleSaveHost} className="space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                       <div>
                          <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: LABEL_COLOR }}>Host Name</label>
                          <input type="text" required value={editingHost.name || ''} onChange={e => setEditingHost({...editingHost, name: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-coral-500 transition-all outline-none" />
                       </div>
                       <div>
                          <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: LABEL_COLOR }}>Host Slug (Subdomain)</label>
                          <input type="text" required value={editingHost.slug || ''} onChange={e => setEditingHost({...editingHost, slug: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: LABEL_COLOR }}>Commission Rate (%)</label>
                              <select required value={editingHost.commissionRate || 3} onChange={e => setEditingHost({...editingHost, commissionRate: parseInt(e.target.value)})} className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none">
                                <option value={3}>3%</option>
                                <option value={4}>4%</option>
                                <option value={5}>5%</option>
                                <option value={6}>6%</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: LABEL_COLOR }}>Subscription Tier</label>
                              <select required value={editingHost.subscriptionType || SubscriptionType.BASIC} onChange={e => setEditingHost({...editingHost, subscriptionType: e.target.value as SubscriptionType})} className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none">
                                <option value={SubscriptionType.BASIC}>Basic (${SUBSCRIPTION_PRICES[SubscriptionType.BASIC]}/mo)</option>
                                <option value={SubscriptionType.PRO}>Pro (${SUBSCRIPTION_PRICES[SubscriptionType.PRO]}/mo)</option>
                                <option value={SubscriptionType.ENTERPRISE}>Enterprise (${SUBSCRIPTION_PRICES[SubscriptionType.ENTERPRISE]}/mo)</option>
                              </select>
                          </div>
                       </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: LABEL_COLOR }}>Bio / Philosophy</label>
                            <textarea value={editingHost.bio || ''} onChange={e => setEditingHost({...editingHost, bio: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-sm text-white h-[100px] resize-none focus:ring-1 focus:ring-coral-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: LABEL_COLOR }}>Airbnb iCal Link</label>
                            <input type="url" value={editingHost.airbnbCalendarLink || ''} onChange={e => setEditingHost({...editingHost, airbnbCalendarLink: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none" placeholder="https://www.airbnb.com/calendar/ical/..." />
                        </div>
                    </div>
                 </div>

                 {/* Premium Feature Config */}
                 <div className="pt-10 border-t border-stone-800/60 space-y-8">
                    <div className="flex items-center justify-between">
                       <div>
                          <h4 className="text-xl font-serif font-bold text-white mb-1">Premium Landing Extension</h4>
                          <p className="text-xs font-medium" style={{ color: LABEL_COLOR }}>Custom host story template below listings</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={editingHost.premiumConfig?.isEnabled || false} 
                            onChange={e => updatePremiumConfig({ isEnabled: e.target.checked })}
                          />
                          <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-500 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white"></div>
                       </label>
                    </div>

                    {editingHost.premiumConfig?.isEnabled && (
                       <div className="space-y-10 animate-in fade-in slide-in-from-top-4">
                          <div className="space-y-4">
                             <label className="block text-xs font-bold uppercase tracking-widest" style={{ color: LABEL_COLOR }}>Extension Images (3-5 URLs)</label>
                             <div className="grid grid-cols-1 gap-3">
                                {[0, 1, 2, 3, 4].map(idx => (
                                   <input 
                                     key={idx}
                                     type="text" 
                                     placeholder={`Image URL ${idx + 1} ${idx < 3 ? '(Required)' : '(Optional)'}`}
                                     value={editingHost.premiumConfig?.images[idx] || ''}
                                     onChange={e => {
                                       const images = [...(editingHost.premiumConfig?.images || [])];
                                       images[idx] = e.target.value;
                                       updatePremiumConfig({ images });
                                     }}
                                     className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-xs text-white outline-none"
                                   />
                                ))}
                             </div>
                          </div>

                          <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold uppercase tracking-widest" style={{ color: LABEL_COLOR }}>Story Sections</label>
                                <button type="button" onClick={addPremiumSection} className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest hover:text-emerald-300">+ Add Content Block</button>
                             </div>
                             <div className="space-y-4">
                                {editingHost.premiumConfig?.sections.map((section, idx) => (
                                   <div key={idx} className="bg-stone-950/50 border border-stone-800 p-6 rounded-2xl relative group">
                                      <button type="button" onClick={() => removePremiumSection(idx)} className="absolute top-4 right-4 text-stone-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                      </button>
                                      <input 
                                        type="text" 
                                        placeholder="Section Title (e.g. Our History)"
                                        value={section.title}
                                        onChange={e => updatePremiumSection(idx, { title: e.target.value })}
                                        className="w-full bg-transparent border-b border-stone-800 mb-4 pb-2 text-sm font-bold text-white outline-none focus:border-emerald-500 transition-colors"
                                      />
                                      <textarea 
                                        placeholder="Section Content..."
                                        value={section.content}
                                        onChange={e => updatePremiumSection(idx, { content: e.target.value })}
                                        className="w-full bg-transparent text-sm text-stone-400 outline-none min-h-[80px] resize-none"
                                      />
                                   </div>
                                ))}
                                {(!editingHost.premiumConfig?.sections || editingHost.premiumConfig.sections.length === 0) && (
                                   <div className="py-8 border border-dashed border-stone-800 rounded-2xl flex items-center justify-center">
                                      <span className="text-stone-700 text-[10px] font-bold uppercase tracking-widest">No custom sections defined</span>
                                   </div>
                                )}
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
                 
                 <div className="flex space-x-4 pt-6 border-t border-stone-800/60">
                    <button type="button" onClick={() => { setShowHostModal(false); setEditingHost(null); }} className="flex-1 font-bold py-5 rounded-full border border-stone-800/60 text-[10px] uppercase tracking-widest hover:text-white transition-colors" style={{ color: LABEL_COLOR }}>Discard</button>
                    <button type="submit" className="flex-1 bg-coral-500 text-white font-bold py-5 rounded-full transition-all text-[10px] uppercase tracking-widest shadow-2xl shadow-coral-500/30 active:scale-95">Save Host Profile</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;