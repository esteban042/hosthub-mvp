import React, { useState } from 'react';
import { Apartment, PriceRule } from '../../types';
import { ALL_AMENITIES } from '../../constants';
import { Tag, Trash2, Info, X } from 'lucide-react';
import DatePicker from '../DatePicker';

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

  const handleToggleAmenity = (amenity: string) => {
    const currentAmenities = apt.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
        ? currentAmenities.filter(a => a !== amenity)
        : [...currentAmenities, amenity];
    setApt({ ...apt, amenities: newAmenities });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-start justify-center p-6 animate-in fade-in duration-300 overflow-y-auto">
       <div className="bg-[#1c1a19] border border-stone-800 w-full max-w-4xl rounded-[3rem] p-10 shadow-2xl space-y-12 my-12 relative text-left font-dm">
          <button onClick={onClose} className="absolute top-10 right-10 text-stone-600 hover:text-white transition-colors"><X className="w-8 h-8" /></button>
          <h3 className="text-3xl font-bold text-white leading-none tracking-tight">Unit Configuration</h3>

          <form onSubmit={handleSave} className="space-y-12">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">Unit Title</label>
                      <input type="text" required value={apt.title || ''} onChange={e => setApt({...apt, title: e.target.value})} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-coral-500 transition-all outline-none" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">City</label>
                         <input type="text" required value={apt.city || ''} onChange={e => setApt({...apt, city: e.target.value})} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-4 text-sm text-white outline-none" />
                      </div>
                      <div>
                         <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">Base Price</label>
                         <input type="number" required value={apt.pricePerNight || 0} onChange={e => setApt({...apt, pricePerNight: parseInt(e.target.value)})} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-4 text-sm text-white outline-none" />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">Minimum Stay</label>
                         <input type="number" value={apt.minStayNights || 1} onChange={e => setApt({...apt, minStayNights: parseInt(e.target.value)})} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-4 text-sm text-white outline-none" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">Map Embed URL</label>
                      <input type="text" value={apt.mapEmbedUrl || ''} onChange={e => setApt({...apt, mapEmbedUrl: e.target.value})} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-coral-500 transition-all outline-none" />
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-[rgb(214,213,213)]  mb-3">Description</label>
                   <textarea value={apt.description || ''} onChange={e => setApt({...apt, description: e.target.value})} className="w-full bg-stone-950 border border-stone-600 rounded-2xl p-4 text-sm text-white h-[142px] resize-none focus:ring-1 focus:ring-coral-500 outline-none" />
                </div>
             </div>

             <div className="pt-10 border-t border-stone-600/60">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                     <Tag className="w-5 h-5 text-emerald-400" />
                     <h4 className="text-xl font-bold text-white tracking-tight">Seasonal Pricing Overrides</h4>
                  </div>
                  <button type="button" onClick={addPriceOverride} className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-6 py-2 rounded-xl hover:bg-emerald-500/20 transition-all">+ Add Rate Rule</button>
               </div>
               
               <div className="space-y-4">
                  {apt.priceOverrides?.map((rule) => (
                    <div key={rule.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-stone-950 p-6 rounded-[1.8rem] border border-stone-600 items-end animate-in slide-in-from-bottom-2">
                       <div>
                          <label className="block text-[10px] font-black uppercase text-[rgb(214,213,213)] mb-2">From Date</label>
                          <DatePicker
                          selectedDate={rule.startDate}
                          onSelect={(date) => updatePriceRule(rule.id, { startDate: date })}
                        />

                       </div>
                       <div>
                          <label className="block text-[10px] font-black uppercase text-[rgb(214,213,213)] mb-2">Until Date</label>
                          <DatePicker
                          selectedDate={rule.endDate}
                          onSelect={(date) => updatePriceRule(rule.id, { endDate: date })}
                        />

                       </div>
                       <div>
                          <label className="block text-[10px] font-black uppercase text-[rgb(214,213,213)] mb-2">Nightly Price ($)</label>
                          <input type="number" value={rule.price} onChange={e => updatePriceRule(rule.id, { price: parseInt(e.target.value) })} className="w-full bg-stone-900 border border-stone-600 rounded-xl p-3 text-xs text-white outline-none" />
                       </div>
                       <button type="button" onClick={() => removePriceOverride(rule.id)} className="p-3 bg-stone-900 border border-stone-600 rounded-xl text-stone-600 hover:text-rose-500 transition-all flex items-center justify-center">
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  ))}
                  {(!apt.priceOverrides || apt.priceOverrides.length === 0) && (
                    <div className="py-12 border border-dashed border-stone-600 rounded-[2rem] flex flex-col items-center justify-center text-stone-600 italic text-sm">
                       <Info className="w-6 h-6 mb-2 opacity-20" />
                       <span>No manual price overrides active for this unit.</span>
                    </div>
                  )}
               </div>
             </div>
             <div className="pt-10 border-t border-stone-800/60">
<div className="flex items-center justify-between mb-8">
    <div className="flex items-center space-x-3">
        <Tag className="w-5 h-5 text-emerald-400" />
        <h4 className="text-xl font-bold text-white tracking-tight">Unit Photos</h4>
    </div>
    <button type="button" onClick={addPhotoUrl} className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-6 py-2 rounded-xl hover:bg-emerald-500/20 transition-all">+ Add Photo URL</button>
</div>
<div className="space-y-4">
    {apt.photos?.map((photo, index) => (
        <div key={index} className="flex items-center space-x-4 bg-stone-950 p-4 rounded-2xl border border-stone-600 animate-in slide-in-from-bottom-2">
            <input
                type="text"
                value={photo}
                onChange={e => updatePhotoUrl(index, e.target.value)}
                placeholder="https://example.com/image.png"
                className="flex-grow bg-stone-900 border border-stone-600 rounded-xl p-3 text-xs text-white outline-none focus:ring-1 focus:ring-coral-500"
            />
            <button
                type="button"
                onClick={() => removePhotoUrl(index)}
                className="p-3 bg-stone-900 border border-stone-600 rounded-xl text-stone-600 hover:text-rose-500 transition-all"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
    ))}
    {(!apt.photos || apt.photos.length === 0) && (
        <div className="py-12 border border-dashed border-stone-600 rounded-[2rem] flex flex-col items-center justify-center text-stone-600 italic text-sm">
            <Info className="w-6 h-6 mb-2 opacity-20" />
            <span>No photos added for this unit. Add at least one photo URL.</span>
        </div>
    )}
</div>
</div>

             <div className="pt-10 border-t border-stone-800/60">
<div className="flex items-center space-x-3 mb-8">
    <Tag className="w-5 h-5 text-emerald-400" />
    <h4 className="text-xl font-bold text-white tracking-tight">Amenities</h4>
</div>
<div className="flex flex-wrap gap-4">
    {ALL_AMENITIES.map(amenity => {
        const isSelected = apt.amenities?.includes(amenity.label);
        return (
            <button
                type="button"
                key={amenity.label}
                onClick={() => handleToggleAmenity(amenity.label)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-2xl border transition-all text-sm font-medium ${
                    isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
            >
                {amenity.icon}
                <span>{amenity.label}</span>
            </button>
        );
    })}
</div>
</div>

             <div className="flex space-x-4 pt-6 border-t border-stone-800/60">
                <button type="button" onClick={onClose} className="flex-1 font-bold py-5 rounded-full border border-stone-800 text-[10px] uppercase tracking-widest text-[rgb(214,213,213)] hover:text-white border-white transition-all">Discard</button>
                <button type="submit" className="flex-1 bg-transparent border border-coral-500 text-coral-500 hover:bg-coral-500/10 font-bold py-5 rounded-full transition-all text-[10px] uppercase tracking-widest active:scale-95">Save Unit</button>
             </div>
          </form>
       </div>
    </div>
  );
};

export default ApartmentEditor;
