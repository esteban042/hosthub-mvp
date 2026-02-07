
import React, { useState, useMemo } from 'react';
import { Host, Apartment, Booking, SubscriptionType, BookingStatus, PremiumConfig, PremiumSection } from '../types';
// Added Crown to the lucide-react imports
import { Building2, Calendar, DollarSign, Edit3, MoreHorizontal, ChevronRight, Plus, Globe, Trash2, Image, Type, Info, Check, Crown } from 'lucide-react';

interface AdminDashboardProps {
  hosts: Host[];
  apartments: Apartment[];
  bookings: Booking[];
  onUpdateHosts: (hosts: Host[]) => void;
}

const THEME_GRAY = 'hsl(30 5% 55%)';

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
  const [activeModalTab, setActiveModalTab] = useState<'basics' | 'content'>('basics');
  const [newImageUrl, setNewImageUrl] = useState('');

  const currentYear = new Date().getFullYear();

  const stats = useMemo(() => {
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
      totalBookingsThisYear: totalBookingsAllHostsThisYear
    };
  }, [hosts, apartments, bookings, currentYear]);

  const handleSaveHost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHost) return;

    if (editingHost.id) {
      onUpdateHosts(hosts.map(h => h.id === editingHost.id ? { ...h, ...editingHost } as Host : h));
    } else {
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

  const addImage = () => {
    if (!newImageUrl) return;
    const currentImages = editingHost?.premiumConfig?.images || [];
    updatePremiumConfig({ images: [...currentImages, newImageUrl] });
    setNewImageUrl('');
  };

  const removeImage = (idx: number) => {
    const currentImages = editingHost?.premiumConfig?.images || [];
    updatePremiumConfig({ images: currentImages.filter((_, i) => i !== idx) });
  };

  const addSection = () => {
    const currentSections = editingHost?.premiumConfig?.sections || [];
    updatePremiumConfig({ 
      sections: [...currentSections, { title: 'New Perspective', content: 'Craft a compelling narrative about your hospitality approach here.' }] 
    });
  };

  const updateSection = (idx: number, updates: Partial<PremiumSection>) => {
    const currentSections = editingHost?.premiumConfig?.sections || [];
    const newSections = [...currentSections];
    newSections[idx] = { ...newSections[idx], ...updates };
    updatePremiumConfig({ sections: newSections });
  };

  const removeSection = (idx: number) => {
    const currentSections = editingHost?.premiumConfig?.sections || [];
    updatePremiumConfig({ sections: currentSections.filter((_, i) => i !== idx) });
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 animate-in fade-in duration-1000 font-dm text-left">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Global Administration</h1>
          <p className="text-coral-500 font-bold uppercase tracking-[0.3em] text-[10px]">Platform HQ</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => { setEditingHost({}); setShowHostModal(true); setActiveModalTab('basics'); }}
            className="bg-transparent border border-white text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-white/10 active:scale-95 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Host</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="bg-stone-900/30 border border-stone-800/60 p-8 rounded-[1.5rem]">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: THEME_GRAY }}>Sub. revenue / mo</p>
          <h4 className="text-3xl font-bold text-white">${stats.monthlySubscription.toLocaleString()}</h4>
        </div>
        <div className="bg-stone-900/30 border border-stone-800/60 p-8 rounded-[1.5rem]">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: THEME_GRAY }}>Total commissions</p>
          <h4 className="text-3xl font-bold text-coral-500">${stats.totalCommission.toLocaleString()}</h4>
        </div>
        <div className="bg-stone-900/30 border border-stone-800/60 p-8 rounded-[1.5rem]">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: THEME_GRAY }}>Active assets</p>
          <h4 className="text-3xl font-bold text-white">{stats.totalAssets}</h4>
        </div>
        <div className="bg-stone-900/30 border border-stone-800/60 p-8 rounded-[1.5rem]">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: THEME_GRAY }}>Bookings ({currentYear})</p>
          <h4 className="text-3xl font-bold text-white">{stats.totalBookingsThisYear}</h4>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-2xl font-dm text-white px-2">Managed Ecosystem</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {hosts.map(h => {
            const hostApts = apartments.filter(a => a.hostId === h.id);
            const hostAptIds = hostApts.map(a => a.id);
            const hostBookings = bookings.filter(b => 
              hostAptIds.includes(b.apartmentId) && 
              (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID) &&
              new Date(b.startDate).getFullYear() === currentYear
            );
            const volumeThisYear = hostBookings.reduce((sum, b) => sum + b.totalPrice, 0);
            const commissionThisYear = volumeThisYear * (h.commissionRate / 100);

            return (
              <div 
                key={h.id} 
                onClick={() => { setEditingHost(h); setShowHostModal(true); setActiveModalTab('basics'); }}
                className="group relative bg-[#1c1a19] border border-stone-800 rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-emerald-500/50 transition-all cursor-pointer shadow-2xl"
              >
                <div className="absolute top-6 right-8">
                  <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    h.subscriptionType === SubscriptionType.ENTERPRISE ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    h.subscriptionType === SubscriptionType.PRO ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-stone-500/10 text-stone-400 border-stone-500/20'
                  }`}>
                    {h.subscriptionType}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-2xl font-serif font-bold text-white leading-tight mb-1">{h.name}</h4>
                    <p className="text-[10px] font-bold text-stone-600 uppercase tracking-widest flex items-center">
                      <Globe className="w-3 h-3 mr-1" /> {h.slug}.wanderlust.com
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-stone-800/60">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-stone-500">Units</p>
                      <div className="flex items-center text-white font-bold text-lg">
                        <Building2 className="w-3.5 h-3.5 mr-2 text-emerald-400" /> {hostApts.length}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-stone-500">Bookings</p>
                      <div className="flex items-center text-white font-bold text-lg">
                        <Calendar className="w-3.5 h-3.5 mr-2 text-emerald-400" /> {hostBookings.length}
                      </div>
                    </div>
                    <div className="col-span-2 space-y-1 pt-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-stone-500">Commission ({currentYear})</p>
                      <div className="flex items-center text-emerald-400 font-bold text-2xl">
                        <DollarSign className="w-4 h-4 mr-1" /> {commissionThisYear.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-stone-800/40 flex justify-center text-left">
                  <div className="flex items-center space-x-2 text-stone-500 group-hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest">
                    <Edit3 className="w-3 h-3" />
                    <span>Configure Host</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showHostModal && editingHost && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300 overflow-y-auto">
           <div className="bg-[#1c1a19] border border-stone-800 w-full max-w-4xl rounded-[3rem] p-0 shadow-2xl my-12 relative overflow-hidden flex flex-col min-h-[85vh]">
              <div className="p-10 border-b border-stone-800 flex justify-between items-center bg-stone-900/30">
                <div className="text-left">
                  <h3 className="text-3xl font-serif font-bold text-white mb-2">Host Intelligence</h3>
                  <div className="flex items-center space-x-6">
                    <button onClick={() => setActiveModalTab('basics')} className={`text-[10px] font-black uppercase tracking-widest transition-colors ${activeModalTab === 'basics' ? 'text-emerald-400' : 'text-stone-500 hover:text-white'}`}>Identity</button>
                    <ChevronRight className="w-3 h-3 text-stone-800" />
                    <button onClick={() => setActiveModalTab('content')} className={`text-[10px] font-black uppercase tracking-widest transition-colors ${activeModalTab === 'content' ? 'text-emerald-400' : 'text-stone-500 hover:text-white'}`}>Landing Designer</button>
                  </div>
                </div>
                <button onClick={() => { setShowHostModal(false); setEditingHost(null); }} className="text-stone-600 hover:text-white transition-colors"><MoreHorizontal className="w-8 h-8 rotate-45" /></button>
              </div>

              <form onSubmit={handleSaveHost} className="flex-1 overflow-y-auto p-12 text-left">
                {activeModalTab === 'basics' ? (
                  <div className="space-y-12">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                           <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Host Name</label>
                              <input type="text" required value={editingHost.name || ''} onChange={e => setEditingHost({...editingHost, name: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none" />
                           </div>
                           <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Subdomain Slug</label>
                              <input type="text" required value={editingHost.slug || ''} onChange={e => setEditingHost({...editingHost, slug: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-sm text-white outline-none" />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Subscription</label>
                                <select value={editingHost.subscriptionType || SubscriptionType.BASIC} onChange={e => setEditingHost({...editingHost, subscriptionType: e.target.value as SubscriptionType})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-sm text-white outline-none">
                                  {Object.values(SubscriptionType).map(v => <option key={v} value={v}>{v.toUpperCase()}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Commission %</label>
                                <input type="number" min="3" max="6" value={editingHost.commissionRate || 3} onChange={e => setEditingHost({...editingHost, commissionRate: parseInt(e.target.value)})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-sm text-white outline-none" />
                              </div>
                           </div>
                        </div>
                        <div className="space-y-8">
                           <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Biography</label>
                              <textarea value={editingHost.bio || ''} onChange={e => setEditingHost({...editingHost, bio: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-sm text-white h-[142px] resize-none outline-none" />
                           </div>
                           <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Avatar URL</label>
                              <input type="text" value={editingHost.avatar || ''} onChange={e => setEditingHost({...editingHost, avatar: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-sm text-white outline-none" />
                           </div>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="space-y-12">
                     <div className="flex items-center justify-between p-8 bg-stone-950 rounded-[2rem] border border-stone-800">
                        <div className="flex items-center space-x-6">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${editingHost.premiumConfig?.isEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-stone-900 text-stone-700'}`}>
                              <Crown className="w-6 h-6" />
                           </div>
                           <div>
                              <h4 className="text-xl font-bold text-white">Premium Landing Extension</h4>
                              <p className="text-xs text-stone-500 font-medium">Enable narrative-driven sections and a visual gallery.</p>
                           </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => updatePremiumConfig({ isEnabled: !editingHost.premiumConfig?.isEnabled })}
                          className={`px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${editingHost.premiumConfig?.isEnabled ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'border border-stone-800 text-stone-600 hover:text-white'}`}
                        >
                           {editingHost.premiumConfig?.isEnabled ? 'Active' : 'Disabled'}
                        </button>
                     </div>

                     {editingHost.premiumConfig?.isEnabled && (
                        <div className="space-y-16 animate-in slide-in-from-bottom-4 duration-500">
                           <div className="space-y-8">
                              <div className="flex items-center space-x-3">
                                 <Image className="w-5 h-5 text-emerald-400" />
                                 <h4 className="text-xl font-bold text-white tracking-tight">Gallery Curation</h4>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                 {editingHost.premiumConfig.images.map((img, i) => (
                                    <div key={i} className="relative aspect-square group rounded-2xl overflow-hidden border border-stone-800">
                                       <img src={img} className="w-full h-full object-cover" alt="" />
                                       <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-black/60 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-rose-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                 ))}
                                 <div className="aspect-square bg-stone-950 border border-stone-800 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 space-y-4">
                                    <input type="text" placeholder="Image URL..." value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className="w-full bg-stone-900 border border-stone-800 rounded-lg p-2 text-[10px] text-white outline-none" />
                                    <button type="button" onClick={addImage} className="w-full py-2 bg-stone-800 text-stone-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">Add</button>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-8">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center space-x-3">
                                    <Type className="w-5 h-5 text-emerald-400" />
                                    <h4 className="text-xl font-bold text-white tracking-tight">Narrative Sections</h4>
                                 </div>
                                 <button type="button" onClick={addSection} className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-6 py-2 rounded-xl hover:bg-emerald-500/20 transition-all">+ Add Story Block</button>
                              </div>
                              <div className="space-y-6">
                                 {editingHost.premiumConfig.sections.map((section, i) => (
                                    <div key={i} className="bg-stone-950 border border-stone-800 p-8 rounded-[2rem] space-y-6 relative group animate-in slide-in-from-bottom-2">
                                       <button type="button" onClick={() => removeSection(i)} className="absolute top-6 right-6 text-stone-800 hover:text-rose-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                                       <div>
                                          <label className="block text-[9px] font-black uppercase text-stone-600 mb-2">Block Heading</label>
                                          <input type="text" value={section.title} onChange={e => updateSection(i, { title: e.target.value })} className="w-full bg-transparent border-b border-stone-800 p-0 py-2 text-xl font-serif font-bold text-white focus:border-emerald-400 outline-none transition-all" />
                                       </div>
                                       <div>
                                          <label className="block text-[9px] font-black uppercase text-stone-600 mb-2">Narrative Content</label>
                                          <textarea value={section.content} onChange={e => updateSection(i, { content: e.target.value })} className="w-full bg-transparent border-none p-0 text-sm text-stone-400 leading-relaxed h-24 resize-none outline-none" />
                                       </div>
                                    </div>
                                 ))}
                                 {editingHost.premiumConfig.sections.length === 0 && (
                                    <div className="py-12 border border-dashed border-stone-800 rounded-[2rem] flex flex-col items-center justify-center text-stone-600 italic text-sm">
                                       <Info className="w-6 h-6 mb-2 opacity-20" />
                                       <span>No narrative sections defined for this host.</span>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
                )}
                
                <div className="sticky bottom-0 bg-[#1c1a19] p-10 border-t border-stone-800 flex space-x-4 mt-auto">
                   <button type="button" onClick={() => { setShowHostModal(false); setEditingHost(null); }} className="flex-1 font-bold py-5 rounded-full border border-stone-800 text-[10px] uppercase tracking-widest text-stone-500 hover:text-white transition-all">Discard</button>
                   <button type="submit" className="flex-1 bg-white text-black font-bold py-5 rounded-full transition-all text-[10px] uppercase tracking-widest hover:bg-stone-200 active:scale-95 flex items-center justify-center space-x-2">
                      <Check className="w-4 h-4" />
                      <span>Commit Changes</span>
                   </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
