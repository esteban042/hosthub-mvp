import React from 'react';
import { useTranslation } from 'react-i18next';
import { FilePlus } from 'lucide-react';

interface AddUnitMenuProps {
  onAddUnit: () => void;
}

const AddUnitMenu: React.FC<AddUnitMenuProps> = ({ onAddUnit }) => {
  const { t } = useTranslation();

  return (
    <button 
      onClick={onAddUnit}
      className=" border border-sky-700 text-sky-700 px-6 py-3 rounded-full font-bold uppercase text-[12px] tracking-widest transition-all flex items-center justify-center space-x-2 hover:bg-sky-700 hover:text-white w-full sm:w-auto flex-shrink-0"
    >
      <FilePlus className="w-4 h-4" strokeWidth={3} />
      <span>{t('host_dashboard.add_unit_menu.add_unit')}</span>
    </button>
  );
};

export default AddUnitMenu;
