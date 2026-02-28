import React, { useState } from 'react';
import { Apartment, PriceRule, Host } from '../../types';
import { Tag, Trash2, Info, X, Plus } from 'lucide-react';
import DatePicker from '../DatePicker';
import AmenitySelector from './AmenitySelector';
import ImageUpload from './ImageUpload';
import { getCurrency } from '../../utils/currencies';

interface ApartmentEditorProps {
  editingApt: Partial<Apartment> | null;
  host: Host | null;
  onSave: (apartment: Partial<Apartment>) => void;
  onClose: () => void;
}

const ApartmentEditor: React.FC<ApartmentEditorProps> = ({ editingApt, host, onSave, onClose }) => {
  const [apt, setApt] = useState<Partial<Apartment> | null>(editingApt);
  const currency = getCurrency(host?.currency?.code);

  if (!apt) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(apt);
  };

  const addPriceOverride = () => {
    const current = apt.priceOverrides || [];
    setApt({
      ...apt,
      priceOverrides: [...current, { id: `pr-${Date.now()}`, startDate: '', endDate: '', price: apt.pricePerNight || 0, label: '' }]
    });
  };

  const removePriceOverride = (id: string) => {
    const current = apt.priceOverrides || [];
    setApt({ ...apt, priceOverrides: current.filter(rule => rule.id !== id) });
  };

  const updatePriceRule = (id: string, updates: Partial<PriceRule>) => {
    const current = apt.priceOverrides || [];
    setApt({
      ...apt,
      priceOverrides: current.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  const addPhotoUrl = (url: string) => {
    const currentPhotos = apt.photos || [];
    setApt({ ...apt, photos: [...currentPhotos, url] });
  };

  const removePhotoUrl = (index: number) => {
    const currentPhotos = apt.photos || [];
    setApt({ ...apt, photos: currentPhotos.filter((_, i) => i !== index) });
  };

  const handleAmenitiesChange = (newAmenities: string[]) => {
    setApt({ ...apt, amenities: newAmenities });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-stone-900/50 backdrop-blur-lg flex items-start justify-center p-4 sm:p-6 animate-in fade-in duration-300 overflow-y-auto">
       <div className="bg-[#F7F5F0] border border-stone-200 w-full max-w-4xl rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl space-y-10 my-8 sm:my-12 relative text-left font-dm">
          <button onClick={onClose} className="absolute top-6 right-6 sm:top-10 sm:right-10 text-stone-400 hover:text-charcoal transition-colors"><X className="w-7 h-7 sm:w-8 sm:h-8" /></button>
          <h3 className="text-2xl sm:text-3xl font-bold text-charcoal leading-none tracking-tight">Unit Configuration</h3>

          <form onSubmit={handleSave} className="space-y-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">Unit Title</label>
                      <input type="text" required value={apt.title || ''} onChange={e => setApt({...apt, title: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
                </div>
                <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">City</label>
                      <input type="text" required value={apt.city || ''} onChange={e => setApt({...apt, city: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal outline-none" />
                </div>
              </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">Beds</label>
                        <input type="number" value={apt.beds || 1} onChange={e => setApt({...apt, beds: parseInt(e.target.value)})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal outline-none" />
                     </div>
                     <div>
                         <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">Bathrooms</label>
                         <input type="number" value={apt.bathrooms || 1} onChange={e => setApt({...apt, bathrooms: parseInt(e.target.value)})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal outline-none" />
                     </div>
                     <div>
                         <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">Guests</label>
                         <input type="number" value={apt.capacity || 1} onChange={e => setApt({...apt, capacity: parseInt(e.target.value)})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal outline-none" />
                     </div>
                 </div>

                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div>
                         <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">Base Price ({currency.symbol})</label>
                         <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            required
                            value={apt.pricePerNight || ''}
                            onChange={e => {
                                const val = e.target.value;
                                if (/^[0-9]*$/.test(val) && val.length <= 7) {
                                    setApt({ ...apt, pricePerNight: val === '' ? 0 : parseInt(val, 10) });
                                }
                            }}
                            placeholder="e.g. 150"
                            className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal outline-none"
                         />
                      </div>
                      <div>
                         <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">Min Stay (Nights)</label>
                         <input type="number" value={apt.minStayNights || 1} onChange={e => setApt({...apt, minStayNights: parseInt(e.target.value)})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal outline-none" />
                      </div>
                      <div>
                         <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">Max Stay (Nights)</label>
                         <input type="number" value={apt.maxStayNights || 30} onChange={e => setApt({...apt, maxStayNights: parseInt(e.target.value)})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal outline-none" />
                      </div>
                </div>
                <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">Map Embed URL</label>
                     <input type="text" value={apt.mapEmbedUrl || ''} onChange={e => setApt({...apt, mapEmbedUrl: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
                </div>
                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">Description</label>
                   <textarea value={apt.description || ''} onChange={e => setApt({...apt, description: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal h-40 sm:h-60 resize-y focus:ring-1 focus:ring-sky-accent outline-none" />
                </div>

             <div className="pt-8 border-t border-stone-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div className="flex items-center space-x-3">
                     <Tag className="w-5 h-5 text-emerald-400" />
                     <h4 className="text-lg sm:text-xl font-bold text-charcoal tracking-tight">Seasonal Pricing</h4>
                  </div>
                  <button type="button" onClick={addPriceOverride} className="text-xs font-black uppercase tracking-widest bg-cyan-600/10 text-cyan-700 border border-cyan-700/40 px-6 py-2 rounded-xl hover:bg-emerald-500/20 transition-all flex items-center justify-center space-x-2">
                    <Plus className="w-4 h-4" strokeWidth={3} />
                    <span>Add Rate Rule</span>
                  </button>
               </div>
               
               <div className="space-y-4">
                  {apt.priceOverrides?.map((rule) => (
                    <div key={rule.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto] gap-4 bg-white/50 p-6 rounded-2xl border border-stone-200 items-end animate-in slide-in-from-bottom-2">
                       <div>
                          <label className="block text-[10px] font-black uppercase text-charcoal/60 mb-2">From Date</label>
                          <DatePicker
                          selectedDate={rule.startDate}
                          onSelect={(date) => updatePriceRule(rule.id, { startDate: date })}
                        />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black uppercase text-charcoal/60 mb-2">Until Date</label>
                          <DatePicker
                          selectedDate={rule.endDate}
                          onSelect={(date) => updatePriceRule(rule.id, { endDate: date })}
                        />
                       </div>
                       <div className="grow">
                          <label className="block text-[10px] font-black uppercase text-charcoal/60 mb-2">Nightly Price ({currency.symbol})</label>
                          <input type="number" value={rule.price} onChange={e => updatePriceRule(rule.id, { price: parseInt(e.target.value) })} className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs text-charcoal outline-none" />
                       </div>
                       <button type="button" onClick={() => removePriceOverride(rule.id)} className="p-3 bg-white border border-stone-300 rounded-xl text-stone-400 hover:text-rose-500 transition-all flex items-center justify-center">
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  ))}\
                  {(!apt.priceOverrides || apt.priceOverrides.length === 0) && (
                    <div className="py-12 border border-dashed border-stone-300 rounded-[2rem] flex flex-col items-center justify-center text-stone-400 italic text-sm text-center">
                       <Info className="w-6 h-6 mb-2 opacity-20" />
                       <span>No seasonal pricing rules configured.</span>
                    </div>
                  )}\
               </div>
             </div>

             <div className="pt-8 border-t border-stone-200">
                <div className="flex items-center space-x-3 mb-8">
                    <Tag className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-lg sm:text-xl font-bold text-charcoal tracking-tight">Unit Photos</h4>
                </div>
                <ImageUpload onUploadComplete={addPhotoUrl} />
                <div className="space-y-4 mt-4">
                    {apt.photos?.map((photo, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 bg-white/50 p-4 rounded-2xl border border-stone-300 animate-in slide-in-from-bottom-2">
                            <img src={photo} alt="Apartment" className="w-20 h-20 sm:w-16 sm:h-16 rounded-lg object-cover" />
                            <input
                                type="text"
                                readOnly
                                value={photo}
                                className="w-full flex-grow bg-white border-stone-300 rounded-xl p-3 text-xs text-charcoal outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => removePhotoUrl(index)}
                                className="p-3 w-full sm:w-auto bg-white border border-stone-300 rounded-xl text-stone-400 hover:text-rose-500 transition-all"
                            >\
                                <Trash2 className="w-5 h-5 mx-auto" />
                            </button>
                        </div>
                    ))}\
                    {(!apt.photos || apt.photos.length === 0) && (
                        <div className="py-12 border border-dashed border-stone-300 rounded-[2rem] flex flex-col items-center justify-center text-stone-400 italic text-sm text-center">
                            <Info className="w-6 h-6 mb-2 opacity-20" />
                            <span>No photos have been added for this unit.</span>
                        </div>
                    )}\
                </div>
              </div>

             <div className="pt-8 border-t border-stone-200">
                <div className="flex items-center space-x-3 mb-8">
                    <Tag className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-lg sm:text-xl font-bold text-charcoal tracking-tight">Amenities</h4>
                </div>
                <AmenitySelector
                  selectedAmenities={apt.amenities || []}
                  onChange={handleAmenitiesChange}
                />
              </div>

             <div className="flex flex-col sm:flex-row-reverse gap-3 pt-6 border-t border-stone-200">
                <button type="submit" className="w-full sm:w-auto bg-sky-700 text-white font-bold py-4 px-8 rounded-full transition-all text-[10px] uppercase tracking-widest hover:bg-sky-800 active:scale-95">Save Unit</button>
                <button type="button" onClick={onClose} className="w-full sm:w-auto font-bold py-4 px-8 rounded-full border border-stone-300 text-charcoal/70 hover:bg-stone-100 transition-all text-[10px] uppercase tracking-widest">Discard</button>
             </div>
          </form>
       </div>
    </div>
  );
};

export default ApartmentEditor;
