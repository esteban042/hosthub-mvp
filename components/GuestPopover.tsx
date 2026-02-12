import React from 'react';

const GuestPopover: React.FC<{
  guests: number;
  onSelect: (val: number) => void;
  onClose: () => void;
}> = ({ guests, onSelect, onClose }) => {
  return (
    <div className="p-8 bg-stone-950 border border-stone-800 rounded-3xl shadow-2xl w-[300px] animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <span className="text-white font-serif font-bold text-lg">Guests</span>
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Select capacity</span>
        </div>
      </div>
      <div className="flex items-center justify-between p-4 bg-stone-900 border border-stone-800 rounded-2xl">
        <button 
          onClick={() => guests > 1 && onSelect(guests - 1)}
          className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center text-white hover:border-coral-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M20 12H4" /></svg>
        </button>
        <span className="text-xl font-black text-white">{guests}</span>
        <button 
          onClick={() => guests < 10 && onSelect(guests + 1)}
          className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center text-white hover:border-coral-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>
      <button onClick={onClose} className="w-full mt-6 bg-coral-500 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-coral-500/20 active:scale-95">Apply</button>
    </div>
  );
};

export default GuestPopover;