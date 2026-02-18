import React from 'react';
import { BookMarked, CalendarDays, Building, BarChart2, Info } from 'lucide-react';

interface DashboardNavProps {
  activeTab: string;
  onTabChange: (tab: 'current-bookings' | 'bookings' | 'calendar' | 'apartments' | 'statistics' | 'general-info') => void;
}

const DashboardNav: React.FC<DashboardNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'current-bookings', label: 'Current', icon: <BookMarked className="w-4 h-4" /> },
    { id: 'bookings', label: 'Bookings', icon: <BookMarked className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'apartments', label: 'Units', icon: <Building className="w-4 h-4" /> },
    { id: 'statistics', label: 'Statistics', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'general-info', label: 'General Info', icon: <Info className="w-4 h-4" /> }
  ];

  return (
    <div className="flex bg-white/50 border border-zinc-800/30 p-2 rounded-xl w-fit mb-12">
      {tabs.map(tab => (
        <button 
          key={tab.id} 
          onClick={() => onTabChange(tab.id as any)} 
          className={`flex items-center space-x-3 px-8 py-4 rounded-lg text-m font-bold transition-all uppercase border border-gray-300 ${activeTab === tab.id ? 'bg-cyan-700/30 shadow-lg' : 'hover:bg-cyan-700/30 hover:text-white'}`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default DashboardNav;
