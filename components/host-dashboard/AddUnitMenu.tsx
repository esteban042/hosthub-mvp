import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, FilePlus, Download } from 'lucide-react';

interface AddUnitMenuProps {
  onAddUnit: () => void;
  onImportFromAirbnb: () => void; 
}

const AddUnitMenu: React.FC<AddUnitMenuProps> = ({ onAddUnit, onImportFromAirbnb }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={toggleMenu}
        className=" border border-sky-700 text-sky-700 px-6 py-3 rounded-full font-bold uppercase text-[12px] tracking-widest transition-all flex items-center justify-center space-x-2 hover:bg-sky-700 hover:text-white w-full sm:w-auto flex-shrink-0"
      >
        <Plus className="w-4 h-4" strokeWidth={3} />
        <span>Add Unit</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 z-10 animate-in fade-in duration-200">
          <div className="p-2">
            <button 
              onClick={() => { onAddUnit(); setIsOpen(false); }}
              className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-charcoal rounded-lg hover:bg-stone-100/80 transition-all"
            >
              <FilePlus className="w-4 h-4 text-sky-700" />
              <span>Create new unit</span>
            </button>
            <button 
              onClick={() => { onImportFromAirbnb(); setIsOpen(false); }}
              className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-charcoal rounded-lg hover:bg-stone-100/80 transition-all"
            >
              <Download className="w-4 h-4 text-sky-700" />
              <span>Import from Airbnb</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUnitMenu;
