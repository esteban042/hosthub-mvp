import React, { useState } from 'react';
import { Share2, Copy, CheckCircle2, Plus } from 'lucide-react';
import { SKY_ACCENT } from '../../constants';

interface DashboardHeaderProps {
  hostSlug: string;
  onAddUnit: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ hostSlug, onAddUnit }) => {
  const [copied, setCopied] = useState(false);

  const shareableUrl = `${window.location.origin}/?host=${hostSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
      <div>
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Host Studio</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-charcoal/40">Asset Operations</p>
      </div>
      
      <div className="bg-white/50 border border-stone-200 p-4 rounded-2xl flex items-center justify-between w-full md:w-[450px] shadow-lg">
         <div className="flex items-center space-x-4 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-sky-accent/10 flex items-center justify-center text-sky-accent flex-shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
               <p className="text-[9px] font-black text-charcoal/40 uppercase tracking-widest mb-1">Your Booking Link</p>
               <p className="text-xs text-charcoal/60 font-medium truncate">{shareableUrl}</p>
            </div>
         </div>
         <button 
           onClick={handleCopyLink}
           className={`ml-4 p-3 rounded-xl transition-all ${copied ? 'bg-sky-accent text-white' : 'bg-stone-200/50 text-charcoal/60 hover:text-charcoal border border-stone-200'}`}
         >
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
         </button>
      </div>
      <button 
        onClick={onAddUnit} 
        className="bg-transparent border border-sky-700 text-sky-700 px-8 py-3 rounded-full font-bold uppercase text-[12px] tracking-widest transition-all flex items-center space-x-2"
      >
        <Plus className="w-4 h-4" strokeWidth={3} />
        <span>Add Unit</span>
      </button>
    </div>
  );
};

export default DashboardHeader;
