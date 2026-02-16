import React, { useState, useEffect } from 'react';
import { Host } from '../../types';
import { COUNTRIES } from '../../utils/countries';
import { sanctumApi } from '../../services/api';

interface HostInfoEditorProps {
  host: Host;
  onHostUpdate: (updatedHost: Host) => void;
}

const HostInfoEditor: React.FC<HostInfoEditorProps> = ({ host, onHostUpdate }) => {
  const [editingHost, setEditingHost] = useState<Partial<Host>>(host);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setEditingHost(host);
  }, [host]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await sanctumApi.updateHosts([editingHost as Host]);
      onHostUpdate(editingHost as Host);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error("Failed to update host:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSocialChange = (platform: 'twitter' | 'facebook' | 'instagram', value: string) => {
    setEditingHost(prev => ({
      ...prev,
      socialMediaLinks: {
        ...(prev.socialMediaLinks || {}),
        [platform]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSave} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">Host Name</label>
            <input type="text" required value={editingHost.name || ''} onChange={e => setEditingHost({...editingHost, name: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm focus:ring-1 focus:ring-sky-accent outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">Avatar Image URL</label>
            <input type="url" value={editingHost.avatar || ''} onChange={e => setEditingHost({...editingHost, avatar: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm focus:ring-1 focus:ring-sky-accent outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">Host Bio (Public)</label>
            <textarea value={editingHost.bio || ''} onChange={e => setEditingHost({...editingHost, bio: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm h-[126px] resize-none focus:ring-1 focus:ring-sky-accent outline-none" />
          </div>
        </div>
        <div className="space-y-6">
           <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">Business Name</label>
            <input type="text" value={editingHost.businessName || ''} onChange={e => setEditingHost({ ...editingHost, businessName: e.target.value })} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">Email</label>
            <input type="email" value={editingHost.contactEmail || ''} onChange={e => setEditingHost({ ...editingHost, contactEmail: e.target.value })} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">Phone Number</label>
            <input type="tel" value={editingHost.phoneNumber || ''} onChange={e => setEditingHost({ ...editingHost, phoneNumber: e.target.value })} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
          </div>
           <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">Address</label>
            <input type="text" value={editingHost.physicalAddress || ''} onChange={e => setEditingHost({ ...editingHost, physicalAddress: e.target.value })} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">Country</label>
            <select
              value={editingHost.country || ''}
              onChange={e => setEditingHost({ ...editingHost, country: e.target.value })}
              className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none appearance-none"
            >
              <option value="">Select a country</option>
              {COUNTRIES.map(country => (
                <option key={country.code} value={country.name}>{country.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">VAT (%)</label>
            <input type="number" value={editingHost.vat || ''} onChange={e => setEditingHost({ ...editingHost, vat: e.target.value ? Number(e.target.value) : undefined })} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
          </div>
        </div>
      </div>
       <div className="space-y-8 pt-8 border-t border-stone-200/60">
        <h2 className="text-xl font-bold font-serif text-charcoal">Check-in / Check-out</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">Check-in time</label>
                <input type="time" value={editingHost.checkInTime || ''} onChange={e => setEditingHost({ ...editingHost, checkInTime: e.target.value })} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
            </div>
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">Check-out time</label>
                <input type="time" value={editingHost.checkOutTime || ''} onChange={e => setEditingHost({ ...editingHost, checkOutTime: e.target.value })} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
            </div>
        </div>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">Check-in information</label>
            <textarea value={editingHost.checkInInfo || ''} onChange={e => setEditingHost({...editingHost, checkInInfo: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm h-[126px] resize-none focus:ring-1 focus:ring-sky-accent outline-none" />
        </div>
      </div>
      <div className="space-y-8 pt-8 border-t border-stone-200/60">
        <h2 className="text-xl font-bold font-serif text-charcoal">Guest Communication</h2>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">Check-in Message</label>
            <textarea value={editingHost.checkInMessage || ''} onChange={e => setEditingHost({...editingHost, checkInMessage: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm h-[126px] resize-none focus:ring-1 focus:ring-sky-accent outline-none" />
        </div>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">Welcome Message</label>
            <textarea value={editingHost.welcomeMessage || ''} onChange={e => setEditingHost({...editingHost, welcomeMessage: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm h-[126px] resize-none focus:ring-1 focus:ring-sky-accent outline-ne" />
        </div>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">Checkout Message</label>
            <textarea value={editingHost.checkoutMessage || ''} onChange={e => setEditingHost({...editingHost, checkoutMessage: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm h-[126px] resize-none focus:ring-1 focus:ring-sky-accent outline-none" />
        </div>
      </div>
      <div className="space-y-8 pt-8 border-t border-stone-200/60">
        <h2 className="text-xl font-bold font-serif text-charcoal">Policies & Instructions</h2>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">Payment Instructions</label>
            <textarea value={editingHost.paymentInstructions || ''} onChange={e => setEditingHost({...editingHost, paymentInstructions: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm h-[126px] resize-none focus:ring-1 focus:ring-sky-accent outline-none" />
        </div>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">Terms</label>
            <textarea value={editingHost.terms || ''} onChange={e => setEditingHost({...editingHost, terms: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm h-[126px] resize-none focus:ring-1 focus:ring-sky-accent outline-none" />
        </div>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">Conditions</label>
            <textarea value={editingHost.conditions || ''} onChange={e => setEditingHost({...editingHost, conditions: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm h-[126px] resize-none focus:ring-1 focus:ring-sky-accent outline-none" />
        </div>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">FAQ</label>
            <textarea value={editingHost.faq || ''} onChange={e => setEditingHost({...editingHost, faq: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm h-[126px] resize-none focus:ring-1 focus:ring-sky-accent outline-none" />
        </div>
      </div>

       <div className="space-y-6 pt-8 border-t border-stone-200/60">
        <h3 className="text-xl font-bold font-serif text-charcoal">Social Media Presence</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">X URL</label>
            <input type="url" value={editingHost.socialMediaLinks?.twitter || ''} onChange={e => handleSocialChange('twitter', e.target.value)} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">Facebook URL</label>
            <input type="url" value={editingHost.socialMediaLinks?.facebook || ''} onChange={e => handleSocialChange('facebook', e.target.value)} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">Instagram URL</label>
            <input type="url" value={editingHost.socialMediaLinks?.instagram || ''} onChange={e => handleSocialChange('instagram', e.target.value)} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-8 border-t border-stone-200/60">
        <a href={`/${host.slug}`} target="_blank" rel="noopener noreferrer" className="mr-4 hover:bg-sky-700/80 hover:text-white border border-sky-700/80 text-sky-700/80 py-4 px-8 rounded-full transition-all text-[12px] tracking-[0.3em] uppercase shadow-2xl shadow-sky-700/30 active:scale-[0.98]">
          Preview Landing Page
        </a>
        <button type="submit" disabled={isSaving} className="hover:bg-sky-700/80 hover:text-white border border-sky-700/80 text-sky-700/80 disabled:bg-alabaster/70 disabled:text-stone-400 disabled:cursor-not-allowed py-4 px-8 rounded-full transition-all text-[12px] tracking-[0.3em] uppercase shadow-2xl shadow-sky-700/30 active:scale-[0.98]">
          {isSaving ? 'Saving...' : isSaved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default HostInfoEditor;
