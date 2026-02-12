import React, { useState } from 'react';
import { Share2, Copy, CheckCircle2 } from 'lucide-react';

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
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Host Studio</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500">Asset Operations</p>
      </div>
      
      <div className="bg-[#1c1a19] border border-stone-800 p-4 rounded-2xl flex items-center justify-between w-full md:w-[450px] shadow-xl">
         <div className="flex items-center space-x-4 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
               <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest mb-1">Your Booking Link</p>
               <p className="text-xs text-stone-400 font-medium truncate">{shareableUrl}</p>
            </div>
         </div>
         <button 
           onClick={handleCopyLink}
           className={`ml-4 p-3 rounded-xl transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-stone-900 text-stone-500 hover:text-white border border-stone-800'}`}
         >
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
         </button>
      </div>
      <button onClick={onAddUnit} className="bg-transparent border border-white text-white hover:bg-coral-500/10 px-8 py-3 rounded-full font-bold uppercase text-[11px] tracking-widest transition-all">Add Unit</button>
    </div>
  );
};

export default DashboardHeader;
