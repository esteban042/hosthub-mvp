
import React, { useState } from 'react';
import { Share2, Copy, CheckCircle2 } from 'lucide-react';
import AddUnitMenu from './AddUnitMenu';

interface DashboardHeaderProps {
  hostSlug: string;
  onAddUnit: () => void;
  onImportFromAirbnb: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ hostSlug, onAddUnit, onImportFromAirbnb }) => {
  const [copied, setCopied] = useState(false);

  const shareableUrl = `${window.location.origin}/?host=${hostSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">Host Studio</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-charcoal/40">Asset Operations</p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="bg-white/50 border border-stone-200 p-4 rounded-2xl flex items-center justify-between w-full sm:w-auto sm:flex-grow md:w-[450px] shadow-lg">
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
        <AddUnitMenu onAddUnit={onAddUnit} onImportFromAirbnb={onImportFromAirbnb} />
      </div>
    </div>
  );
};

export default DashboardHeader;
