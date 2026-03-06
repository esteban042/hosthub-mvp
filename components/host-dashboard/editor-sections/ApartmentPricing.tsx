
import React from 'react';
import { Apartment, PriceRule, Host } from '../../../types';
import { getCurrency } from '../../../utils/currencies';
import { Plus, Trash2, Info } from 'lucide-react';
import DatePicker from '../../DatePicker';

interface ApartmentPricingProps {
  apt: Partial<Apartment>;
  host: Host | null;
  onAptChange: (field: keyof Apartment, value: any) => void;
  onUpdatePriceRule: (id: string, updates: Partial<PriceRule>) => void;
  onAddPriceRule: () => void;
  onRemovePriceRule: (id: string) => void;
}

const ApartmentPricing: React.FC<ApartmentPricingProps> = ({ 
    apt, host, onAptChange, onUpdatePriceRule, onAddPriceRule, onRemovePriceRule 
}) => {
  const currency = getCurrency(host?.currency?.code);

  return (
    <div className="space-y-10">
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
                            onAptChange('pricePerNight', val === '' ? 0 : parseInt(val, 10));
                        }
                    }}
                    placeholder="e.g. 150"
                    className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal outline-none"
                />
            </div>
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">Min Stay (Nights)</label>
                <input type="number" value={apt.minStayNights || 1} onChange={e => onAptChange('minStayNights', parseInt(e.target.value))} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal outline-none" />
            </div>
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">Max Stay (Nights)</label>
                <input type="number" value={apt.maxStayNights || 30} onChange={e => onAptChange('maxStayNights', parseInt(e.target.value))} className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal outline-none" />
            </div>
        </div>

        <div className="pt-8 border-t border-stone-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h4 className="text-lg sm:text-xl font-bold text-charcoal tracking-tight">Seasonal Pricing</h4>
                <button type="button" onClick={onAddPriceRule} className="text-xs font-black uppercase tracking-widest bg-cyan-600/10 text-cyan-700 border border-cyan-700/40 px-6 py-2 rounded-xl hover:bg-emerald-500/20 transition-all flex items-center justify-center space-x-2">
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
                                onSelect={(date) => onUpdatePriceRule(rule.id, { startDate: date })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-charcoal/60 mb-2">Until Date</label>
                            <DatePicker
                                selectedDate={rule.endDate}
                                onSelect={(date) => onUpdatePriceRule(rule.id, { endDate: date })}
                            />
                        </div>
                        <div className="grow">
                            <label className="block text-[10px] font-black uppercase text-charcoal/60 mb-2">Nightly Price ({currency.symbol})</label>
                            <input type="number" value={rule.price} onChange={e => onUpdatePriceRule(rule.id, { price: parseInt(e.target.value) })} className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs text-charcoal outline-none" />
                        </div>
                        <button type="button" onClick={() => onRemovePriceRule(rule.id)} className="p-3 bg-white border border-stone-300 rounded-xl text-stone-400 hover:text-rose-500 transition-all flex items-center justify-center">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}
                {(!apt.priceOverrides || apt.priceOverrides.length === 0) && (
                    <div className="py-12 border border-dashed border-stone-300 rounded-[2rem] flex flex-col items-center justify-center text-stone-400 italic text-sm text-center">
                        <Info className="w-6 h-6 mb-2 opacity-20" />
                        <span>No seasonal pricing rules configured.</span>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default ApartmentPricing;
