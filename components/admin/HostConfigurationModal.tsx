
import React, { useState, useEffect } from 'react';
import { Host, SubscriptionType, PremiumConfig, PremiumSection } from '../../types';
import { X, ShieldCheck, Layout, BarChart, ImageIcon, Type, Trash2, Zap, FileText } from 'lucide-react';
import { COUNTRIES } from '../../utils/countries';

interface HostConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (host: Partial<Host>) => void;
  initialHost: Partial<Host> | null;
  monthlyStats: any[]; // Consider defining a more specific type for this
}

const HostConfigurationModal: React.FC<HostConfigurationModalProps> = ({ 
  isOpen, onClose, onSave, initialHost, monthlyStats 
}) => {
  const [editingHost, setEditingHost] = useState<Partial<Host> | null>(initialHost);
  const [activeModalTab, setActiveModalTab] = useState<'basics' | 'content' | 'legal' | 'statistics'>('basics');

  useEffect(() => {
    setEditingHost(initialHost);
  }, [initialHost]);

  if (!isOpen || !editingHost) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editingHost);
  };

  const addPremiumSection = () => {
    const current = editingHost.premiumConfig?.sections || [];
    setEditingHost({
      ...editingHost,
      premiumConfig: {
        ...(editingHost.premiumConfig || { isEnabled: true, images: [], sections: [] }),
        sections: [...current, { title: '', content: '' }]
      }
    });
  };

  const updatePremiumSection = (idx: number, updates: Partial<PremiumSection>) => {
    const sections = [...(editingHost.premiumConfig?.sections || [])];
    sections[idx] = { ...sections[idx], ...updates };
    setEditingHost({
      ...editingHost,
      premiumConfig: {
        ...(editingHost.premiumConfig || { isEnabled: true, images: [], sections: [] }),
        sections
      }
    });
  };

  const removePremiumSection = (idx: number) => {
    const sections = (editingHost.premiumConfig?.sections || []).filter((_, i) => i !== idx);
    setEditingHost({
      ...editingHost,
      premiumConfig: {
        ...(editingHost.premiumConfig || { isEnabled: true, images: [], sections: [] }),
        sections
      }
    });
  };

  const addPremiumImage = () => {
    const current = editingHost.premiumConfig?.images || [];
    setEditingHost({
      ...editingHost,
      premiumConfig: {
        ...(editingHost.premiumConfig || { isEnabled: true, images: [], sections: [] }),
        images: [...current, '']
      }
    });
  };

  const updatePremiumImage = (idx: number, val: string) => {
    const images = [...(editingHost.premiumConfig?.images || [])];
    images[idx] = val;
    setEditingHost({
      ...editingHost,
      premiumConfig: {
        ...(editingHost.premiumConfig || { isEnabled: true, images: [], sections: [] }),
        images
      }
    });
  };

  const removePremiumImage = (idx: number) => {
    const images = (editingHost.premiumConfig?.images || []).filter((_, i) => i !== idx);
    setEditingHost({
      ...editingHost,
      premiumConfig: {
        ...(editingHost.premiumConfig || { isEnabled: true, images: [], sections: [] }),
        images
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-[#1c1a19] border border-stone-800 w-full max-w-5xl rounded-[3rem] p-10 shadow-2xl relative my-12 text-left font-dm">
        <button onClick={onClose} className="absolute top-10 right-10 text-stone-600 hover:text-white transition-colors"><X className="w-8 h-8" /></button>
        
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-white mb-2">Host Entity Configuration</h3>
          <p className="text-[10px] font-bold text-[rgb(214,213,213)] uppercase tracking-widest">Update network privileges and landing data</p>
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
          <button 
            onClick={() => setActiveModalTab('legal')} 
            className={`px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${activeModalTab === 'legal' ? 'bg-stone-800 text-white' : 'text-stone-600 hover:text-stone-400'}`}
          >
            <FileText className="w-4 h-4" />
            <span>Legal</span>
          </button>
          <button 
            onClick={() => setActiveModalTab('statistics')} 
            className={`px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${activeModalTab === 'statistics' ? 'bg-stone-800 text-white' : 'text-stone-600 hover:text-stone-400'}`}
          >
            <BarChart className="w-4 h-4" />
            <span>Statistics</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-12">
          {activeModalTab === 'basics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">Host Name</label>
                  <input type="text" required value={editingHost.name || ''} onChange={e => setEditingHost({...editingHost, name: e.target.value})} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-5 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)] mb-3">Subdomain Slug</label>
                  <input type="text" required value={editingHost.slug || ''} onChange={e => setEditingHost({...editingHost, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-5 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none" placeholder="e.g. alpine-stays" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)] mb-3">SaaS Tier</label>
                    <select value={editingHost.subscriptionType} onChange={e => setEditingHost({...editingHost, subscriptionType: e.target.value as SubscriptionType})} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-5 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none">
                      <option value={SubscriptionType.BASIC}>Basic Node</option>
                      <option value={SubscriptionType.PRO}>Pro Cluster</option>
                      <option value={SubscriptionType.ENTERPRISE}>Enterprise Grid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">Comm. Rate (%)</label>
                    <input type="number" required value={editingHost.commissionRate || 3} onChange={e => setEditingHost({...editingHost, commissionRate: parseInt(e.target.value)})} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-5 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">Airbnb iCal Link</label>
                  <input type="url" value={editingHost.airbnbCalendarLink || ''} onChange={e => setEditingHost({...editingHost, airbnbCalendarLink: e.target.value})} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-5 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none" placeholder="https://www.airbnb.com/calendar/ical/..." />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">Landingpage Picture</label>
                  <input type="url" value={editingHost.landingPagePicture || ''} onChange={e => setEditingHost({...editingHost, landingPagePicture: e.target.value})} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-5 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none" placeholder="https://example.com/image.jpg" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">Payment Instructions (Email)</label>
                  <textarea value={editingHost.paymentInstructions || ''} onChange={e => setEditingHost({...editingHost, paymentInstructions: e.target.value})} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-5 text-xs text-stone-400 h-[100px] resize-none focus:ring-1 focus:ring-coral-500 outline-none italic" placeholder="Instructions shown to guests after booking confirmation..." />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">Business Name</label>
                  <input type="text" value={editingHost.businessName || ''} onChange={e => setEditingHost({ ...editingHost, businessName: e.target.value })} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-coral-500 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">Email</label>
                  <input type="email" value={editingHost.contactEmail || ''} onChange={e => setEditingHost({ ...editingHost, contactEmail: e.target.value })} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-coral-500 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">Phone Number</label>
                  <input type="tel" value={editingHost.phoneNumber || ''} onChange={e => setEditingHost({ ...editingHost, phoneNumber: e.target.value })} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-coral-500 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">Address</label>
                  <input type="text" value={editingHost.physicalAddress || ''} onChange={e => setEditingHost({ ...editingHost, physicalAddress: e.target.value })} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-coral-500 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">Country</label>
                  <select
                    value={editingHost.country || ''}
                    onChange={e => setEditingHost({ ...editingHost, country: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-coral-500 transition-all outline-none appearance-none"
                  >
                    <option value="">Select a country</option>
                    {COUNTRIES.map(country => (
                      <option key={country.code} value={country.name}>{country.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">Avatar Image URL</label>
                  <input type="url" value={editingHost.avatar || ''} onChange={e => setEditingHost({...editingHost, avatar: e.target.value})} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-5 text-sm text-white focus:ring-1 focus:ring-coral-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">Host Bio (Public)</label>
                  <textarea value={editingHost.bio || ''} onChange={e => setEditingHost({...editingHost, bio: e.target.value})} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-5 text-sm text-white h-[126px] resize-none focus:ring-1 focus:ring-coral-500 outline-none" />
                </div>
              </div>
            </div>
          )}

          {activeModalTab === 'content' && (
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

          {activeModalTab === 'legal' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)] mb-3">Terms of Service</label>
                <textarea value={editingHost.terms || ''} onChange={e => setEditingHost({...editingHost, terms: e.target.value})} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-5 text-sm text-white h-48 resize-none focus:ring-1 focus:ring-coral-500 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)] mb-3">Conditions</label>
                <textarea value={editingHost.conditions || ''} onChange={e => setEditingHost({...editingHost, conditions: e.target.value})} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-5 text-sm text-white h-48 resize-none focus:ring-1 focus:ring-coral-500 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)] mb-3">FAQ</label>
                <textarea value={editingHost.faq || ''} onChange={e => setEditingHost({...editingHost, faq: e.target.value})} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-5 text-sm text-white h-48 resize-none focus:ring-1 focus:ring-coral-500 outline-none" />
              </div>
            </div>
          )}

          {activeModalTab === 'statistics' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h4 className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center space-x-2">
                <BarChart className="w-4 h-4" />
                <span>Monthly Performance</span>
              </h4>
              <div className="overflow-hidden border border-stone-800 rounded-2xl">
                <table className="min-w-full divide-y divide-stone-800">
                  <thead className="bg-stone-950">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-black text-stone-400 uppercase tracking-widest">Month</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-black text-stone-400 uppercase tracking-widest">Bookings</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-black text-stone-400 uppercase tracking-widest">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/50 bg-[#1c1a19]">
                    {monthlyStats.length > 0 ? monthlyStats.map(stat => (
                      <tr key={stat.month}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{stat.month}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-300">{stat.bookings}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-300">${stat.commission.toFixed(2)}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="text-center py-10 text-sm text-stone-500">No booking data for this host.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-12 border-t border-stone-800/40">
            <button type="button" onClick={onClose} className="flex-1 font-black py-6 rounded-2xl border border-coral-500/20 text-[10px] uppercase tracking-widest text-stone-500 hover:text-white border-white transition-all">Discard Changes</button>
            <button type="submit" className="flex-1 bg-transparent border border-coral-500 hover:bg-coral-500 text-white font-black py-6 rounded-2xl transition-all text-[10px] uppercase tracking-widest active:scale-95 shadow-2xl shadow-coral-500/20">SAVE</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HostConfigurationModal;
