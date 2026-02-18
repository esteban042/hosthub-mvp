import { Host, SubscriptionPlan } from "../../types";
import { SKY_ACCENT } from "../../constants";
import { X, Plus } from 'lucide-react';

interface HostConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  host: Host | null;
  onUpdate: (hostData: Partial<Host>) => void;
}

const HostConfigurationModal: React.FC<HostConfigurationModalProps> = ({ isOpen, onClose, host, onUpdate }) => {
  
  if (!isOpen || !host) return null;

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const subscriptionPlan = formData.get('subscriptionPlan') as SubscriptionPlan;
    const updatedHostData: Partial<Host> = {
      subscriptionPlan,
      features: {
        ...host.features,
        booking: formData.get('booking') === 'on',
        googleMaps: formData.get('googleMaps') === 'on',
      }
    };
    onUpdate(updatedHostData);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-stone-900/50 backdrop-blur-lg flex items-start justify-center p-6 animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-[#F7F5F0] border border-stone-200 w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl space-y-8 my-12 relative text-left font-dm">
        <button onClick={onClose} className="absolute top-10 right-10 text-stone-400 hover:text-charcoal transition-colors"><X className="w-8 h-8" /></button>
        <h3 className="text-3xl font-bold text-charcoal leading-none tracking-tight">Configure {host.name}</h3>
        
        <form onSubmit={handleUpdate} className="space-y-8">
          <div>
            <label htmlFor="subscriptionPlan" className="block text-[10px] font-black uppercase tracking-widest text-charcoal/60 mb-3">Subscription Plan</label>
            <select 
              id="subscriptionPlan" 
              name="subscriptionPlan"
              defaultValue={host.subscriptionPlan} 
              className="w-full bg-white/50 border border-stone-300 rounded-2xl p-4 text-sm text-charcoal focus:ring-1 focus:ring-sky-accent transition-all outline-none"
            >
              {Object.values(SubscriptionPlan).map(plan => 
                <option key={plan} value={plan}>{plan}</option>
              )}
            </select>
          </div>

          <div className="pt-8 border-t border-stone-200">
            <div className="flex items-center space-x-3 mb-6">
              <h4 className="text-xl font-bold text-charcoal tracking-tight">Feature Flags</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/50 p-4 rounded-2xl border border-stone-300">
                <label htmlFor="booking" className="text-sm font-medium text-charcoal">Enable Booking</label>
                <input type="checkbox" id="booking" name="booking" defaultChecked={host.features.booking} className="h-6 w-6 rounded-lg text-sky-500 focus:ring-sky-500" />
              </div>
              <div className="flex items-center justify-between bg-white/50 p-4 rounded-2xl border border-stone-300">
                <label htmlFor="googleMaps" className="text-sm font-medium text-charcoal">Enable Google Maps</label>
                <input type="checkbox" id="googleMaps" name="googleMaps" defaultChecked={host.features.googleMaps} className="h-6 w-6 rounded-lg text-sky-500 focus:ring-sky-500" />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-stone-200">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-bold text-charcoal tracking-tight">Domain Configuration</h4>
              <button type="button" className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-6 py-2 rounded-xl hover:bg-emerald-500/20 transition-all flex items-center">
                <Plus className="w-4 h-4 mr-2" /> Add Domain
              </button>
            </div>
            <div className="space-y-4">
              {host.domains.map((domain, index) => (
                <div key={index} className="flex items-center justify-between bg-white/50 p-4 rounded-2xl border border-stone-300">
                  <span className="text-sm font-medium text-charcoal">{domain}</span>
                </div>
              ))}
              {host.domains.length === 0 && <p className="text-stone-500 text-sm">No domains configured.</p>}
            </div>
          </div>
          
          <div className="flex space-x-4 pt-6 border-t border-stone-200">
             <button type="button" onClick={onClose} className="flex-1 font-bold py-5 rounded-full border border-stone-300 text-[10px] uppercase tracking-widest text-charcoal hover:bg-stone-100 transition-all">Cancel</button>
             <button type="submit" style={{ backgroundColor: SKY_ACCENT }} className="flex-1 border border-transparent text-white font-bold py-5 rounded-full transition-all text-[10px] uppercase tracking-widest active:scale-95">Save Configuration</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HostConfigurationModal;
