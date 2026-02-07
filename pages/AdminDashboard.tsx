
import React, { useState, useMemo } from 'react';
import { Host, Apartment, Booking, SubscriptionType, BookingStatus, PremiumConfig, PremiumSection } from '../types';
import { 
  Building2, 
  Globe, 
  Plus, 
  Copy, 
  ExternalLink, 
  X, 
  Zap, 
  ShieldCheck, 
  Layout, 
  Image as ImageIcon, 
  Type, 
  Trash2, 
  Percent, 
  CreditCard,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Layers
} from 'lucide-react';

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
  hosts, apartments, bookings, onUpdateHosts
}) => {
  const [showHostModal, setShowHostModal] = useState(false);
  const [editingHost, setEditingHost] = useState<Partial<Host> | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'basics' | 'content'>('basics');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const stats = useMemo(() => {
    const subRev = hosts.reduce((acc, h) => acc + (SUBSCRIPTION_PRICES[h.subscriptionType] || 0), 0);
    const totalCommission = hosts.reduce((acc, h) => {
      const hostApts = apartments.filter(a => a.hostId === h.id).map(a => a.id);
      const hostVolume = bookings
        .filter(b => hostApts.includes(b.apartmentId) && (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID))
        .reduce((sum, b) => sum + b.totalPrice, 0);
      return acc + (hostVolume * (h.commissionRate / 100));
    }, 0);
    return { 
      monthlySubscription: subRev, 
      totalCommission, 
      activeHosts: hosts.length, 
      totalAssets: apartments.length 
    };
  }, [hosts, apartments, bookings]);

  const handleSaveHost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHost) return;
    
    if (editingHost.id) {
      onUpdateHosts(hosts.map(h => h.id === editingHost.id ? { ...h, ...editingHost } as Host : h));
    } else {
      const newHost: Host = {
        id: `host-${Math.random().toString(36).substr(2, 9)}`,
        slug: editingHost.slug?.toLowerCase().replace(/\s+/g, '-') || 'new-host',
        name: editingHost.name || 'New Elite Host',
        bio: editingHost.bio || '',
        avatar: editingHost.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        subscriptionType: editingHost.subscriptionType || SubscriptionType.BASIC,
        commissionRate: editingHost.commissionRate || 3,
        premiumConfig: editingHost.premiumConfig || { isEnabled: false, images: [], sections: [] },
        ...editingHost
      } as Host;
      onUpdateHosts([...hosts, newHost]);
    }
    setShowHostModal(false);
    setEditingHost(null);
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/?host=${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const addPremiumSection = () => {
    const current = editingHost?.premiumConfig?.sections || [];
    setEditingHost({
      ...editingHost,
      premiumConfig: {
        ...(editingHost?.premiumConfig || { isEnabled: true, images: [], sections: [] }),
        sections: [...current, { title: '', content: '' }]
      }
    });
  };

  const updatePremiumSection = (idx: number, updates: Partial<PremiumSection>) => {
    const sections = [...(editingHost?.premiumConfig?.sections || [])];
    sections[idx] = { ...sections[idx], ...updates };
    setEditingHost({
      ...editingHost,
      premiumConfig: {
        ...(editingHost?.premiumConfig || { isEnabled: true, images: [], sections: [] }),
        sections
      }
    });
  };

  const removePremiumSection = (idx: number) => {
    const sections = (editingHost?.premiumConfig?.sections || []).filter((_, i) => i !== idx);
    setEditingHost({
      ...editingHost,
      premiumConfig: {
        ...(editingHost?.premiumConfig || { isEnabled: true, images: [], sections: [] }),
        sections
      }
    });
  };

  const addPremiumImage = () => {
    const current = editingHost?.premiumConfig?.images || [];
    setEditingHost({
      ...editingHost,
      premiumConfig: {
        ...(editingHost?.premiumConfig || { isEnabled: true, images: [], sections: [] }),
        images: [...current, '']
      }
    });
  };

  const updatePremiumImage = (idx: number, val: string) => {
    const images = [...(editingHost?.premiumConfig?.images || [])];
    images[idx] = val;
    setEditingHost({
      ...editingHost,
      premiumConfig: {
        ...(editingHost?.premiumConfig || { isEnabled: true, images: [], sections: [] }),
        images
      }
    });
  };

  const removePremiumImage = (idx: number) => {
    const images = (editingHost?.premiumConfig?.images || []).filter((_, i) => i !== idx);
    setEditingHost({
      ...editingHost,
      premiumConfig: {
        ...(editingHost?.premiumConfig || { isEnabled: true, images: [], sections: [] }),
        images
      }
    });
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 animate-in fade-in duration-1000 font-dm text-left">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Global Administration</h1>
          <p className="text-coral-500 font-bold uppercase tracking-[0.3em] text-[10px]">Platform HQ</p>
        </div>
        <button 
          onClick={() => { setEditingHost({ premiumConfig: { isEnabled: false, images: [], sections: [] } }); setShowHostModal(true); setActiveModalTab('basics'); }}
          className="bg-white text-black px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all hover:bg-stone-200 flex items-center space-x-3 active:scale-95 shadow-2xl shadow-white/10"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          <span>Onboard Host</span>
        </button>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="bg-[#1c1a19] p-8 rounded-[2rem] border border-stone-800 shadow-xl">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6">
            <CreditCard className="w-6 h-6" />
          </div>
          <h4 className="text-2xl font-black text-white leading-none">${stats.monthlySubscription.toLocaleString()}</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-stone-500">Monthly SaaS Revenue</p>
        </div>
        <div className="bg-[#1c1a19] p-8 rounded-[2rem] border border-stone-800 shadow-xl">
          <div className="w-12 h-12 bg-coral-500/10 rounded-2xl flex items-center justify-center text-coral-500 mb-6">
            <Percent className="w-6 h-6" />
          </div>
          <h4 className="text-2xl font-black text-white leading-none">${Math.round(stats.totalCommission).toLocaleString()}</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-stone-500">Platform Commission</p>
        </div>
        <div className="bg-[#1c1a19] p-8 rounded-[2rem] border border-stone-800 shadow-xl">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
            <Globe className="w-6 h-6" />
          </div>
          <h4 className="text-2xl font-black text-white leading-none">{stats.activeHosts}</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-stone-500">Active Host Nodes</p>
        </div>
        <div className="bg-[#1c1a19] p-8 rounded-[2rem] border border-stone-800 shadow-xl">
          <div className="w-12 h-12 bg-stone-100/10 rounded-2xl flex items-center justify-center text-stone-300 mb-6">
            <Layers className="w-6 h-6" />
          </div>
          <h4 className="text-2xl font-black text-white leading-none">{stats.totalAssets}</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-stone-500">Global Asset Count</p>
        </div>
      </div>

      {/* Hosts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hosts.map(h => {
          const hostApts = apartments.filter(a => a.hostId === h.id);
          const activeUrl = `${window.location.origin}/?host=${h.slug}`;
          const isCopied = copiedSlug === h.slug;
          
          return (
            <div key={h.id} className="bg-[#1c1a19] border border-stone-800 rounded-[2.5rem] p-8 flex flex-col shadow-2xl group hover:border-emerald-500/40 transition-all">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-16 h-16 rounded-2xl overflow-hidden border border-stone-800">
                    <img src={h.avatar} className="w-full h-full object-cover" alt={h.name} />
                 </div>
                 <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                   h.subscriptionType === SubscriptionType.ENTERPRISE ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                   h.subscriptionType === SubscriptionType.PRO ? 'bg-coral-500/10 text-coral-500 border-coral-500/20' :
                   'bg-stone-900 text-stone-400 border-stone-800'
                 }`}>
                    {h.subscriptionType} Tier
                 </div>
              </div>

              <div className="mb-8">
                <h4 className="text-2xl font-serif font-bold text-white mb-2">{h.name}</h4>
                <div className="flex items-center justify-between p-3 bg-stone-950 border border-stone-800 rounded-xl">
                   <p className="text-[10px] text-stone-600 font-bold truncate max-w-[160px]">{h.slug}.hosthub.com</p>
                   <button 
                     onClick={() => handleCopyLink(h.slug)}
                     className={`transition-colors ${isCopied ? 'text-emerald-400' : 'text-stone-700 hover:text-white'}`}
                   >
                     {isCopied ? <ShieldCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-6 border-y border-stone-800/40 mb-8">
                 <div>
                   <p className="text-[9px] font-black uppercase text-stone-500 mb-1 tracking-widest">Managed Units</p>
                   <p className="text-xl font-black text-white">{hostApts.length}</p>
                 </div>
                 <div>
                   <p className="text-[9px] font-black uppercase text-stone-500 mb-1 tracking-widest">Commission</p>
                   <p className="text-xl font-black text-white">{h.commissionRate}%</p>
                 </div>
              </div>

              <div className="flex items-center space-x-3 mt-auto">
                <button 
                  onClick={() => { setEditingHost(h); setShowHostModal(true); setActiveModalTab('basics'); }}
                  className="flex-1 bg-stone-900 border border-stone-800 text-stone-400 hover:text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Configure Node
                </button>
                <a 
                  href={activeUrl} 
                  target="_blank" 
                  className="p-4 bg-stone-900 border border-stone-800 text-stone-400 hover:text-emerald-400 rounded-xl transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Host Configuration Modal */}
      {showHostModal && editingHost && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-[#1c1a19] border border-stone-800 w-full max-w-5xl rounded-[3rem] p-10 shadow-2xl relative my-12 text-left font-dm">
            <button onClick={() => { setShowHostModal(false); setEditingHost(null); }} className="absolute top-10 right-10 text-stone-600 hover:text-white transition-colors"><X className="w-8 h-8" /></button>
            
            <div className="mb-12">
              <h3 className="text-3xl font-bold text-white mb-2">Host Entity Configuration</h3>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Update network privileges and landing data</p>
            </div>

            <div className="flex bg-stone-950 border border-stone-800 p-2 rounded-2xl w-fit mb-12">
              <button 
                onClick={() => setActiveModalTab('basics')} 
                className={`px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${activeModalTab === 'basics' ? 'bg-stone-800 text-white' : 'text-stone-600 hover:text-stone-400'}`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Basics</span>
              </button>
              <button 
                onClick={() => setActiveModalTab('content')} 
                className={`px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${activeModalTab === 'content' ? 'bg-stone-800 text-white' : 'text-stone-600 hover:text-stone-400'}`}
              >
                <Layout className="w-4 h-4" />
                <span>Premium Content</span>
              </button>
            </div>

            <form onSubmit={handleSaveHost} className="space-y-12">
              {activeModalTab === 'basics' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-stone-600 mb-3">Host Name</label>
                      <input type="text" required value={editingHost.name || ''} onChange={e => setEditingHost({...editingHost, name: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-5 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-stone-600 mb-3">Subdomain Slug</label>
                      <input type="text" required value={editingHost.slug || ''} onChange={e => setEditingHost({...editingHost, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-5 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none" placeholder="e.g. alpine-stays" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-600 mb-3">SaaS Tier</label>
                        <select value={editingHost.subscriptionType} onChange={e => setEditingHost({...editingHost, subscriptionType: e.target.value as SubscriptionType})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-5 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none">
                          <option value={SubscriptionType.BASIC}>Basic Node</option>
                          <option value={SubscriptionType.PRO}>Pro Cluster</option>
                          <option value={SubscriptionType.ENTERPRISE}>Enterprise Grid</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-600 mb-3">Comm. Rate (%)</label>
                        <input type="number" required value={editingHost.commissionRate || 3} onChange={e => setEditingHost({...editingHost, commissionRate: parseInt(e.target.value)})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-5 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-stone-600 mb-3">Airbnb iCal Link</label>
                      <input type="url" value={editingHost.airbnbCalendarLink || ''} onChange={e => setEditingHost({...editingHost, airbnbCalendarLink: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-5 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none" placeholder="https://www.airbnb.com/calendar/ical/..." />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-stone-600 mb-3">Host Bio (Public)</label>
                      <textarea value={editingHost.bio || ''} onChange={e => setEditingHost({...editingHost, bio: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-5 text-sm text-white h-[126px] resize-none focus:ring-1 focus:ring-coral-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-stone-600 mb-3">Avatar Image URL</label>
                      <input type="url" value={editingHost.avatar || ''} onChange={e => setEditingHost({...editingHost, avatar: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-5 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-stone-600 mb-3">Payment Instructions (Email)</label>
                      <textarea value={editingHost.paymentInstructions || ''} onChange={e => setEditingHost({...editingHost, paymentInstructions: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-5 text-xs text-stone-400 h-[100px] resize-none focus:ring-1 focus:ring-coral-500 outline-none italic" placeholder="Instructions shown to guests after booking confirmation..." />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-12">
                   <div className="flex items-center justify-between p-6 bg-stone-950 border border-stone-800 rounded-3xl">
                      <div className="flex items-center space-x-4">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${editingHost.premiumConfig?.isEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-stone-900 text-stone-600'}`}>
                            <Zap className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-white font-bold">Premium Layout Extension</p>
                            <p className="text-xs text-stone-500">Enable "Beyond the Ordinary" immersive landing sections</p>
                         </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setEditingHost({...editingHost, premiumConfig: {...(editingHost.premiumConfig || {isEnabled: false, images: [], sections: []}), isEnabled: !editingHost.premiumConfig?.isEnabled}})}
                        className={`w-16 h-8 rounded-full transition-all relative ${editingHost.premiumConfig?.isEnabled ? 'bg-emerald-500' : 'bg-stone-800'}`}
                      >
                         <div className={`absolute top-1 bottom-1 w-6 bg-white rounded-full transition-all shadow-md ${editingHost.premiumConfig?.isEnabled ? 'right-1' : 'left-1'}`} />
                      </button>
                   </div>

                   {editingHost.premiumConfig?.isEnabled && (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-8">
                           <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center space-x-2">
                                 <ImageIcon className="w-4 h-4" />
                                 <span>Gallery Assets</span>
                              </h4>
                              <button type="button" onClick={addPremiumImage} className="text-[10px] font-black uppercase tracking-widest text-emerald-400">+ Add Image</button>
                           </div>
                           <div className="space-y-3">
                              {(editingHost.premiumConfig?.images || []).map((img, idx) => (
                                <div key={idx} className="flex space-x-2">
                                   <input type="url" value={img} onChange={e => updatePremiumImage(idx, e.target.value)} className="flex-1 bg-stone-950 border border-stone-800 rounded-xl p-4 text-xs text-white focus:ring-1 focus:ring-coral-500 outline-none" placeholder="https://..." />
                                   <button type="button" onClick={() => removePremiumImage(idx)} className="p-4 bg-stone-900 text-stone-600 hover:text-rose-500 rounded-xl transition-all">
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                </div>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-8">
                           <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center space-x-2">
                                 <Type className="w-4 h-4" />
                                 <span>Story Sections</span>
                              </h4>
                              <button type="button" onClick={addPremiumSection} className="text-[10px] font-black uppercase tracking-widest text-emerald-400">+ Add Section</button>
                           </div>
                           <div className="space-y-6">
                              {(editingHost.premiumConfig?.sections || []).map((section, idx) => (
                                <div key={idx} className="p-6 bg-stone-950 border border-stone-800 rounded-3xl space-y-4">
                                   <div className="flex justify-between items-center">
                                      <p className="text-[10px] font-black text-stone-700 uppercase tracking-widest">Section {idx + 1}</p>
                                      <button type="button" onClick={() => removePremiumSection(idx)} className="text-stone-700 hover:text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                   </div>
                                   <input type="text" value={section.title} onChange={e => updatePremiumSection(idx, {title: e.target.value})} className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-sm text-white outline-none" placeholder="Section Title" />
                                   <textarea value={section.content} onChange={e => updatePremiumSection(idx, {content: e.target.value})} className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-xs text-stone-400 h-24 resize-none outline-none" placeholder="Narrative content..." />
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                   )}
                </div>
              )}

              <div className="flex space-x-4 pt-12 border-t border-stone-800/40">
                <button type="button" onClick={() => { setShowHostModal(false); setEditingHost(null); }} className="flex-1 font-black py-6 rounded-2xl border border-stone-800 text-[10px] uppercase tracking-widest text-stone-500 hover:text-white transition-all">Discard Changes</button>
                <button type="submit" className="flex-1 bg-coral-500 hover:bg-coral-600 text-white font-black py-6 rounded-2xl transition-all text-[10px] uppercase tracking-widest active:scale-95 shadow-2xl shadow-coral-500/20">Authorize Host Config</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
