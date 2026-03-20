import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Host } from '../../types';
import { COUNTRIES } from '../../utils/countries';
import { sanctumApi } from '../../services/api';

interface HostInfoEditorProps {
  host: Host;
  onHostUpdate: (updatedHost: Host) => void;
}

const HostInfoEditor: React.FC<HostInfoEditorProps> = ({ host, onHostUpdate }) => {
  const { t } = useTranslation();
  const [editingHost, setEditingHost] = useState<Partial<Host>>(host);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [icalUrl, setIcalUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setEditingHost(host);
    if (host && host.id) {
      setIcalUrl(`${window.location.origin}/api/v1/ical/host/${host.id}`);
    }
  }, [host]);

  const handleFileUpload = async (file: File, type: 'avatar' | 'landing-page') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await sanctumApi.uploadFile(formData);
      const { url } = response;
      if (type === 'avatar') {
        setEditingHost({ ...editingHost, avatar: url });
      } else {
        setEditingHost({ ...editingHost, landingPagePicture: url });
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { currency, ...hostData } = editingHost as Host;
      await sanctumApi.updateHost(hostData as Host);
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

  const handleCopy = () => {
    navigator.clipboard.writeText(icalUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.host_name')}</label>
            <input type="text" required value={editingHost.name || ''} onChange={e => setEditingHost({...editingHost, name: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm focus:ring-1 focus:ring-sky-accent outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.avatar_image')}</label>
            <input type="file" onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'avatar')} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm focus:ring-1 focus:ring-sky-accent outline-none" />
            {editingHost.avatar && <img src={editingHost.avatar} alt="Avatar" className="w-32 h-32 mt-4" />}
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.landing_page_picture')}</label>
            <input type="file" onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'landing-page')} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm focus:ring-1 focus:ring-sky-accent outline-none" />
            {editingHost.landingPagePicture && <img src={editingHost.landingPagePicture} alt="Landing Page" className="w-full h-auto mt-4" />}
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.host_bio')}</label>
            <textarea value={editingHost.bio || ''} onChange={e => setEditingHost({...editingHost, bio: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm h-[126px] resize-none focus:ring-1 focus:ring-sky-accent outline-none" />
          </div>
        </div>
        <div className="space-y-6">
           <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.business_name')}</label>
            <input type="text" value={editingHost.businessName || ''} onChange={e => setEditingHost({ ...editingHost, businessName: e.target.value })} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.email')}</label>
            <input type="email" value={editingHost.contactEmail || ''} onChange={e => setEditingHost({ ...editingHost, contactEmail: e.target.value })} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.phone_number')}</label>
            <input type="tel" value={editingHost.phoneNumber || ''} onChange={e => setEditingHost({ ...editingHost, phoneNumber: e.target.value })} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
          </div>
           <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.address')}</label>
            <input type="text" value={editingHost.physicalAddress || ''} onChange={e => setEditingHost({ ...editingHost, physicalAddress: e.target.value })} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.country')}</label>
            <select
              value={editingHost.country || ''}
              onChange={e => setEditingHost({ ...editingHost, country: e.target.value })}
              className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none appearance-none"
            >
              <option value="">{t('host_dashboard.host_info.select_country')}</option>
              {COUNTRIES.map(country => (
                <option key={country.code} value={country.name}>{country.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.vat')}</label>
            <input type="number" value={editingHost.vat || ''} onChange={e => setEditingHost({ ...editingHost, vat: e.target.value ? Number(e.target.value) : undefined })} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
          </div>
        </div>
      </div>
       <div className="space-y-8 pt-8 border-t border-stone-200/60">
        <h2 className="text-xl font-bold font-serif text-charcoal">{t('host_dashboard.host_info.check_in_out_title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.check_in_time')}</label>
                <input type="time" value={editingHost.checkInTime || ''} onChange={e => setEditingHost({ ...editingHost, checkInTime: e.target.value })} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
            </div>
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.check_out_time')}</label>
                <input type="time" value={editingHost.checkOutTime || ''} onChange={e => setEditingHost({ ...editingHost, checkOutTime: e.target.value })} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
            </div>
        </div>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.check_in_info')}</label>
            <textarea value={editingHost.checkInInfo || ''} onChange={e => setEditingHost({...editingHost, checkInInfo: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm h-[126px] resize-none focus:ring-1 focus:ring-sky-accent outline-none" />
        </div>
      </div>
      <div className="space-y-8 pt-8 border-t border-stone-200/60">
        <h2 className="text-xl font-bold font-serif text-charcoal">{t('host_dashboard.host_info.guest_communication_title')}</h2>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.check_in_message')}</label>
            <textarea value={editingHost.checkInMessage || ''} onChange={e => setEditingHost({...editingHost, checkInMessage: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm h-[126px] resize-none focus:ring-1 focus:ring-sky-accent outline-none" />
        </div>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.welcome_message')}</label>
            <textarea value={editingHost.welcomeMessage || ''} onChange={e => setEditingHost({...editingHost, welcomeMessage: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm h-[126px] resize-none focus:ring-1 focus:ring-sky-accent outline-ne" />
        </div>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.checkout_message')}</label>
            <textarea value={editingHost.checkoutMessage || ''} onChange={e => setEditingHost({...editingHost, checkoutMessage: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm h-[126px] resize-none focus:ring-1 focus:ring-sky-accent outline-none" />
        </div>
      </div>
      <div className="space-y-8 pt-8 border-t border-stone-200/60">
        <h2 className="text-xl font-bold font-serif text-charcoal">{t('host_dashboard.host_info.policies_title')}</h2>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.deposit_percentage')}</label>
            <input type="number" value={editingHost.depositPercentage || ''} onChange={e => setEditingHost({ ...editingHost, depositPercentage: e.target.value ? Number(e.target.value) : undefined })} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
        </div>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.payment_instructions')}</label>
            <textarea value={editingHost.paymentInstructions || ''} onChange={e => setEditingHost({...editingHost, paymentInstructions: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm h-[126px] resize-none focus:ring-1 focus:ring-sky-accent outline-none" />
        </div>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.house_rules')}</label>
            <textarea value={editingHost.houseRules || ''} onChange={e => setEditingHost({...editingHost, houseRules: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm h-[126px] resize-none focus:ring-1 focus:ring-sky-accent outline-none" />
        </div>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.terms')}</label>
            <textarea value={editingHost.terms || ''} onChange={e => setEditingHost({...editingHost, terms: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm h-[126px] resize-none focus:ring-1 focus:ring-sky-accent outline-none" />
        </div>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.conditions')}</label>
            <textarea value={editingHost.conditions || ''} onChange={e => setEditingHost({...editingHost, conditions: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm h-[126px] resize-none focus:ring-1 focus:ring-sky-accent outline-none" />
        </div>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.faq')}</label>
            <textarea value={editingHost.faq || ''} onChange={e => setEditingHost({...editingHost, faq: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-5 text-sm h-[126px] resize-none focus:ring-1 focus:ring-sky-accent outline-none" />
        </div>
      </div>

      <div className="space-y-8 pt-8 border-t border-stone-200/60">
        <h2 className="text-xl font-bold font-serif text-charcoal">{t('host_dashboard.host_info.ical_feed_title')}</h2>
        <div className="relative">
          <input type="text" readOnly value={icalUrl} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
          <button type="button" onClick={handleCopy} className="absolute right-2 top-1/2 -translate-y-1/2 bg-sky-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-sky-800 transition-all">
            {isCopied ? t('host_dashboard.host_info.copied') : t('host_dashboard.host_info.copy')}
          </button>
        </div>
      </div>

       <div className="space-y-6 pt-8 border-t border-stone-200/60">
        <h3 className="text-xl font-bold font-serif text-charcoal">{t('host_dashboard.host_info.social_media_title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.x_url')}</label>
            <input type="url" value={editingHost.socialMediaLinks?.twitter || ''} onChange={e => handleSocialChange('twitter', e.target.value)} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.facebook_url')}</label>
            <input type="url" value={editingHost.socialMediaLinks?.facebook || ''} onChange={e => handleSocialChange('facebook', e.target.value)} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/80 mb-3">{t('host_dashboard.host_info.instagram_url')}</label>
            <input type="url" value={editingHost.socialMediaLinks?.instagram || ''} onChange={e => handleSocialChange('instagram', e.target.value)} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-8 border-t border-stone-200/60">
        <a href={`/${host.slug}`} target="_blank" rel="noopener noreferrer" className="mr-4 hover:bg-sky-700/80 hover:text-white border border-sky-700/80 text-sky-700/80 py-4 px-8 rounded-full transition-all text-[12px] tracking-[0.3em] uppercase shadow-2xl shadow-sky-700/30 active:scale-[0.98]">
          {t('host_dashboard.host_info.preview_landing_page')}
        </a>
        <button type="submit" disabled={isSaving} className="hover:bg-sky-700/80 hover:text-white border border-sky-700/80 text-sky-700/80 disabled:bg-alabaster/70 disabled:text-stone-400 disabled:cursor-not-allowed py-4 px-8 rounded-full transition-all text-[12px] tracking-[0.3em] uppercase shadow-2xl shadow-sky-700/30 active:scale-[0.98]">
          {isSaving ? t('host_dashboard.host_info.saving') : isSaved ? t('host_dashboard.host_info.saved') : t('host_dashboard.host_info.save_changes')}
        </button>
      </div>
    </form>
  );
};

export default HostInfoEditor;
