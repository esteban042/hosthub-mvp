import React, { useState } from 'react';
import { Apartment, PriceRule } from '../../types';
import { Tag, Trash2, Info, X, Plus } from 'lucide-react';
import DatePicker from '../DatePicker';
import AmenitySelector from '../AmenitySelector';

interface ApartmentEditorProps {
  editingApt: Partial<Apartment> | null;
  onSave: (apartment: Partial<Apartment>) => void;
  onClose: () => void;
}

const ApartmentEditor: React.FC<ApartmentEditorProps> = ({ editingApt, onSave, onClose }) => {
  const [apt, setApt] = useState<Partial<Apartment> | null>(editingApt);

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

  const addPhotoUrl = () => {
    const currentPhotos = apt.photos || [];
    setApt({ ...apt, photos: [...currentPhotos, ''] });
  };

  const updatePhotoUrl = (index: number, url: string) => {
    const currentPhotos = apt.photos || [];
    const newPhotos = [...currentPhotos];
    newPhotos[index] = url;
    setApt({ ...apt, photos: newPhotos });
  };

  const removePhotoUrl = (index: number) => {
    const currentPhotos = apt.photos || [];
    setApt({ ...apt, photos: currentPhotos.filter((_, i) => i !== index) });
  };

  const handleAmenitiesChange = (newAmenities: string[]) => {
    setApt({ ...apt, amenities: newAmenities });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-stone-900/50 backdrop-blur-lg flex items-start justify-center p-6 animate-in fade-in duration-300 overflow-y-auto">
       <div className="bg-[#F7F5F0] border border-stone-200 w-full max-w-4xl rounded-[3rem] p-10 shadow-2xl space-y-12 my-12 relative text-left font-dm">
          <button onClick={onClose} className="absolute top-10 right-10 text-stone-400 hover:text-charcoal transition-colors"><X className="w-8 h-8" /></button>
          <h3 className="text-3xl font-bold text-charcoal leading-none tracking-tight">Unit Configuration</h3>

          <form onSubmit={handleSave} className="space-y-12">
             <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
                <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">Unit Title</label>
                      <input type="text" required value={apt.title || ''} onChange={e => setApt({...apt, title: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
                </div>
                <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">City</label>
                      <input type="text" required value={apt.city || ''} onChange={e => setApt({...apt, city: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal outline-none" />
                </div>
              </div>
                <div className="grid grid-cols-3 gap-4">
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

                   <div className="grid grid-cols-3 gap-4">
                   <div>
                         <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">Base Price</label>
                         <input type="number" required value={apt.pricePerNight || 0} onChange={e => setApt({...apt, pricePerNight: parseInt(e.target.value)})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal outline-none" />
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
                <div className="grid grid-cols-1 gap-4">
                     <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">Map Embed URL</label>
                      <input type="text" value={apt.mapEmbedUrl || ''} onChange={e => setApt({...apt, mapEmbedUrl: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal focus:ring-1 focus:ring-sky-accent transition-all outline-none" />
                     </div>

               </div>
                <div className="grid grid-cols-1 gap-4">

                  <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">Description</label>
                   <textarea value={apt.description || ''} onChange={e => setApt({...apt, description: e.target.value})} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal h-[240px] resize-y focus:ring-1 focus:ring-sky-accent outline-none" />
                  </div>
               </div>

             <div className="pt-10 border-t border-stone-200">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                     <Tag className="w-5 h-5 text-emerald-400" />
                     <h4 className="text-xl font-bold text-charcoal tracking-tight">Seasonal Pricing Overrides</h4>
                  </div>
                  <button type="button" onClick={addPriceOverride} className="text-[10px] font-black uppercase tracking-widest bg-cyan-600/10 text-cyan-700 border border-cyan-700/40 px-6 py-2 rounded-xl hover:bg-emerald-500/20 transition-all flex items-center space-x-2">
                    <Plus className="w-4 h-4" strokeWidth={3} /> 
                    <span>Add Rate Rule</span>
                  </button>
               </div>
               
               <div className="space-y-4">
                  {apt.priceOverrides?.map((rule) => (
                    <div key={rule.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/50 p-6 rounded-[1.8rem] border border-stone-200 items-end animate-in slide-in-from-bottom-2">
                       <div>
                          <label className="block bg-white/50 text-[10px] font-black uppercase text-charcoal/60 mb-2">From Date</label>
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
                       <div>
                          <label className="block text-[10px] font-black uppercase text-charcoal/60 mb-2">Nightly Price ($)</label>
                          <input type="number" value={rule.price} onChange={e => updatePriceRule(rule.id, { price: parseInt(e.target.value) })} className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs text-charcoal outline-none" />
                       </div>
                       <button type="button" onClick={() => removePriceOverride(rule.id)} className="p-3 bg-white border border-stone-300 rounded-xl text-stone-400 hover:text-rose-500 transition-all flex items-center justify-center">
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  ))}
                  {(!apt.priceOverrides || apt.priceOverrides.length === 0) && (
                    <div className="py-12 border border-dashed border-stone-300 rounded-[2rem] flex flex-col items-center justify-center text-stone-400 italic text-sm">
                       <Info className="w-6 h-6 mb-2 opacity-20" />
                       <span>No manual price overrides active for this unit.</span>
                    </div>
                  )}
               </div>
             </div>
             <div className="pt-10 border-t border-stone-200">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <Tag className="w-5 h-5 text-emerald-400" />
                        <h4 className="text-xl font-bold text-charcoal tracking-tight">Unit Photos</h4>
                    </div>
                    <button type="button" onClick={addPhotoUrl} className="text-[10px] font-black uppercase tracking-widest bg-cyan-600/10 text-cyan-700 border border-cyan-700/40 px-6 py-2 rounded-xl hover:bg-emerald-500/20 transition-all flex items-center space-x-2">
                      <Plus className="w-4 h-4" strokeWidth={3} />
                      <span>Add Photo URL</span>
                    </button>
                </div>
                <div className="space-y-4">
                    {apt.photos?.map((photo, index) => (
                        <div key={index} className="flex items-center space-x-4 bg-white/50 p-4 rounded-2xl border border-stone-300 animate-in slide-in-from-bottom-2">
                            <input
                                type="text"
                                value={photo}
                                onChange={e => updatePhotoUrl(index, e.target.value)}
                                placeholder="https://example.com/image.png"
                                className="flex-grow bg-white border border-stone-300 rounded-xl p-3 text-xs text-charcoal outline-none focus:ring-1 focus:ring-sky-accent"
                            />
                            <button
                                type="button"
                                onClick={() => removePhotoUrl(index)}
                                className="p-3 bg-white border border-stone-300 rounded-xl text-stone-400 hover:text-rose-500 transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                    {(!apt.photos || apt.photos.length === 0) && (
                        <div className="py-12 border border-dashed border-stone-300 rounded-[2rem] flex flex-col items-center justify-center text-stone-400 italic text-sm">
                            <Info className="w-6 h-6 mb-2 opacity-20" />
                            <span>No photos added for this unit. Add at least one photo URL.</span>
                        </div>
                    )}
                </div>
              </div>

             <div className="pt-10 border-t border-stone-200">
                <div className="flex items-center space-x-3 mb-8">
                    <Tag className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-xl font-bold text-charcoal tracking-tight">Amenities</h4>
                </div>
                <AmenitySelector
                  selectedAmenities={apt.amenities || []}
                  onChange={handleAmenitiesChange}
                />
              </div>

             <div className="flex space-x-4 pt-6 border-t border-stone-200">
                <button type="button" onClick={onClose} className="flex-1 font-bold py-5 rounded-full border border-stone-300 text-[10px] uppercase tracking-widest text-charcoal hover:bg-stone-100 transition-all">Discard</button>
                <button type="submit" className="flex-1 border border-cyan-700 text-cyan-700 bg-transparent hover:bg-cyan-700 hover:text-white font-bold py-5 rounded-full transition-all text-[10px] uppercase tracking-widest active:scale-95">Save Unit</button>
             </div>
          </form>
       </div>
    </div>
  );
};

export default ApartmentEditor;
