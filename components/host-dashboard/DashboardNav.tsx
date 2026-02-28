import React from 'react';
import { BookMarked, CalendarDays, Building, BarChart2, Info, Activity } from 'lucide-react';

interface DashboardNavProps {
  activeTab: string;
  onTabChange: (tab: 'current-bookings' | 'bookings' | 'calendar' | 'apartments' | 'statistics' | 'general-info') => void;
}

const DashboardNav: React.FC<DashboardNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'current-bookings', label: 'Current', icon: <Activity className="w-5 h-5" /> },
    { id: 'bookings', label: 'All Bookings', icon: <BookMarked className="w-5 h-5" /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'apartments', label: 'Units', icon: <Building className="w-5 h-5" /> },
    { id: 'statistics', label: 'Statistics', icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'general-info', label: 'Settings', icon: <Info className="w-5 h-5" /> }
  ];

  return (
    <div className="mb-12 border-b border-gray-200">
      <div className="overflow-x-auto pb-px">
        <div className="flex space-x-1 sm:space-x-2 whitespace-nowrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as any)}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-3 text-sm font-bold transition-all rounded-t-lg
                ${
                  activeTab === tab.id
                    ? 'border-b-2 border-sky-600 text-sky-700'
                    : 'border-b-2 border-transparent text-charcoal/60 hover:text-sky-700'
                }`
              }
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardNav;
