import React, { useState, useMemo } from 'react';
import { Host, Apartment, Booking, SubscriptionType, BookingStatus, PremiumConfig, PremiumSection } from '../types';
import { hostHubApi } from '../services/api';
import { Building2, Calendar, DollarSign, Crown, Edit3, MoreHorizontal, ChevronRight, Plus, Globe, Trash2, Image, Type, Info, Database } from 'lucide-react';

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
  const [activeModalTab, setActiveModalTab] = useState<'basics' | 'content'>('basics');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [seeding, setSeeding] = useState(false);

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

  const handleSeedDatabase = async () => {
    // Removed confirm() due to sandboxing issues.
    setSeeding(true);
    try {
      await hostHubApi.seedDatabase();
      alert("Success! Supabase tables have been seeded. Please refresh the app to see the live data.");
      window.location.reload();
    } catch (e: any) {
      alert("Seed Failed: " + e.message + "\n\nEnsure you have run the SQL script to create tables and RLS policies in your Supabase project.");
    } finally {
      setSeeding(false);
    }
  };

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
            disabled={seeding}
            onClick={handleSeedDatabase}
            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-emerald-500/20 active:scale-95 flex items-center space-x-2"
          >
            <Database className={`w-4 h-4 ${seeding ? 'animate-pulse' : ''}`} />
            <span>{seeding ? 'Syncing...' : 'Seed System'}</span>
          </button>
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

              <form onSubmit={handleSaveHost} className="flex-1 overflow-y-auto">
                {activeModalTab === 'basics' ? (
                  <div className="p-12 space-y-12 text-left">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                           <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Host Name</label>
                              <input type="text" required value={editingHost.name || ''} onChange={e => setEditingHost({...editingHost, name: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none" />
                           </div>
                           <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Host Slug</label>
                              <input type="text" required value={editingHost.slug || ''} onChange={e => setEditingHost({...editingHost, slug: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none" />
                           </div>
                           <div className="grid grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Commission (%)</label>
                                  <select value={editingHost.commissionRate || 3} onChange={e => setEditingHost({...editingHost, commissionRate: parseInt(e.target.value)})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-sm text-white outline-none">
                                    {[3, 4, 5, 6].map(v => <option key={v} value={v}>{v}%</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Subscription</label>
                                  <select value={editingHost.subscriptionType || SubscriptionType.BASIC} onChange={e => setEditingHost({...editingHost, subscriptionType: e.target.value as SubscriptionType})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-sm text-white outline-none">
                                    <option value={SubscriptionType.BASIC}>Basic</option>
                                    <option value={SubscriptionType.PRO}>Pro</option>
                                    <option value={SubscriptionType.ENTERPRISE}>Enterprise</option>
                                  </select>
                              </div>
                           </div>
                        </div>
                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Bio / Brand Story</label>
                                <textarea value={editingHost.bio || ''} onChange={e => setEditingHost({...editingHost, bio: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-sm text-white h-[142px] resize-none outline-none" />
                            </div>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="p-12 space-y-16 text-left">
                     {/* Premium Toggle */}
                     <div className="flex items-center justify-between p-8 bg-stone-950 border border-stone-800 rounded-3xl shadow-xl">
                        <div className="flex items-center space-x-5">
                          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                            <Crown className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-lg leading-none mb-2">Premium Experience Extensions</h4>
                            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Showcase storytelling sections on the guest landing page</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                           <input type="checkbox" className="sr-only peer" checked={editingHost.premiumConfig?.isEnabled || false} onChange={e => updatePremiumConfig({ isEnabled: e.target.checked })} />
                           <div className="w-14 h-8 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-stone-500 after:border-stone-400 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white"></div>
                        </label>
                     </div>

                     {editingHost.premiumConfig?.isEnabled && (
                       <div className="space-y-16 animate-in slide-in-from-bottom-4 duration-500">
                          {/* Gallery Management */}
                          <div className="space-y-6">
                            <div className="flex items-center space-x-3 mb-2">
                               <Image className="w-5 h-5 text-emerald-400" />
                               <h4 className="text-xl font-serif font-bold text-white">Brand Imagery</h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                               {editingHost.premiumConfig.images.map((img, i) => (
                                 <div key={i} className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-stone-800 bg-stone-950">
                                    <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                                    <button 
                                      type="button" 
                                      onClick={() => removeImage(i)}
                                      className="absolute top-2 right-2 p-2 bg-stone-900/80 backdrop-blur-md rounded-lg text-stone-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all border border-stone-800"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                 </div>
                               ))}
                               <div className="aspect-[3/4] rounded-2xl border-2 border-dashed border-stone-800 flex flex-col items-center justify-center p-6 text-center space-y-4">
                                  <div className="space-y-2 w-full">
                                    <input 
                                      type="text" 
                                      placeholder="Paste URL..." 
                                      value={newImageUrl} 
                                      onChange={e => setNewImageUrl(e.target.value)}
                                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-[10px] text-white outline-none"
                                    />
                                    <button 
                                      type="button" 
                                      onClick={addImage}
                                      className="w-full bg-stone-800 text-white font-bold py-2 rounded-xl text-[9px] uppercase tracking-widest hover:bg-stone-700 transition-colors"
                                    >
                                      Add Image
                                    </button>
                                  </div>
                               </div>
                            </div>
                          </div>

                          {/* Storytelling Sections */}
                          <div className="space-y-6">
                            <div className="flex items-center justify-between mb-2">
                               <div className="flex items-center space-x-3">
                                  <Type className="w-5 h-5 text-emerald-400" />
                                  <h4 className="text-xl font-serif font-bold text-white">Narrative Sections</h4>
                               </div>
                               <button 
                                 type="button" 
                                 onClick={addSection}
                                 className="text-[9px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 rounded-xl hover:bg-emerald-500/10 transition-colors"
                               >
                                 + Add Section
                               </button>
                            </div>
                            
                            <div className="space-y-6">
                               {editingHost.premiumConfig.sections.map((section, i) => (
                                 <div key={i} className="bg-stone-950 border border-stone-800 rounded-3xl p-8 relative group shadow-lg">
                                    <button 
                                      type="button" 
                                      onClick={() => removeSection(i)}
                                      className="absolute top-6 right-8 text-stone-700 hover:text-rose-500 transition-colors"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                       <div className="md:col-span-1 space-y-2">
                                          <label className="block text-[9px] font-black uppercase text-stone-600 tracking-widest">Section Title</label>
                                          <input 
                                            type="text" 
                                            value={section.title} 
                                            onChange={e => updateSection(i, { title: e.target.value })}
                                            className="w-full bg-stone-900 border border-stone-800 rounded-xl p-4 text-sm text-white outline-none font-bold"
                                          />
                                       </div>
                                       <div className="md:col-span-2 space-y-2">
                                          <label className="block text-[9px] font-black uppercase text-stone-600 tracking-widest">Narrative Content</label>
                                          <textarea 
                                            value={section.content} 
                                            onChange={e => updateSection(i, { content: e.target.value })}
                                            className="w-full bg-stone-900 border border-stone-800 rounded-xl p-4 text-sm text-white h-24 resize-none outline-none leading-relaxed"
                                          />
                                       </div>
                                    </div>
                                 </div>
                               ))}
                               {editingHost.premiumConfig.sections.length === 0 && (
                                 <div className="py-16 border border-dashed border-stone-800 rounded-[2.5rem] flex flex-col items-center justify-center text-stone-600 italic space-y-2">
                                    <Info className="w-8 h-8 opacity-20" />
                                    <p className="text-sm">No storytelling sections defined yet.</p>
                                 </div>
                               )}
                            </div>
                          </div>
                       </div>
                     )}
                  </div>
                )}

                <div className="p-10 border-t border-stone-800 bg-stone-900/30 flex space-x-4 sticky bottom-0 z-20">
                  <button type="button" onClick={() => { setShowHostModal(false); setEditingHost(null); }} className="flex-1 font-bold py-5 rounded-full border border-stone-800 text-[10px] uppercase tracking-widest text-stone-500 hover:text-white transition-colors">Discard</button>
                  <button type="submit" className="flex-1 bg-coral-500 text-white font-bold py-5 rounded-full text-[10px] uppercase tracking-widest shadow-2xl shadow-coral-500/30 active:scale-95 transition-all">Save Host Data</button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;