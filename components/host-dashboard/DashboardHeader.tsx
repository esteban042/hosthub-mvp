
import React, { useState } from 'react';
import { Share2, Copy, CheckCircle2 } from 'lucide-react';
import AddUnitMenu from './AddUnitMenu';
import Modal from '../Modal';

interface DashboardHeaderProps {
  hostSlug: string;
  onAddUnit: () => void;
  onImportFromAirbnb: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ hostSlug, onAddUnit, onImportFromAirbnb }) => {
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const shareableUrl = `${window.location.origin}/?host=${hostSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">Host Studio</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-charcoal/40">Asset Operations</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="rounded-2xl flex items-center justify-center w-full sm:w-auto"
          >
            <div className="w-10 h-10 rounded-xl border border-sky-700/60 flex items-center justify-center text-sky-700">
              <Share2 className="w-5 h-5" />
            </div>
          </button>
          <AddUnitMenu onAddUnit={onAddUnit} onImportFromAirbnb={onImportFromAirbnb} />
        </div>
      </div>

      <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title="Share Your Booking Link">
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">Share this link with your guests to allow them to book directly.</p>
          <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
            <span className="text-sm text-gray-800 truncate">{shareableUrl}</span>
            <button 
              onClick={handleCopyLink}
              className={`ml-4 p-3 rounded-xl transition-all ${copied ? 'bg-sky-accent text-white' : 'bg-stone-200/50 text-charcoal/60 hover:text-charcoal border border-stone-200'}`}
            >
               {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DashboardHeader;
