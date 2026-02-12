import React from 'react';
import { CORE_ICONS, CARD_BORDER, EMERALD_ACCENT, THEME_GRAY } from '../../constants';
import { History } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    activeUnits: number;
    active: number;
    past: number;
    revenueYear: number;
  };
}

const LABEL_COLOR = 'rgb(168, 162, 158)';

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      <div className="bg-[#1c1a19] p-8 rounded-2xl flex items-center space-x-5 border" style={{ borderColor: CARD_BORDER }}>
        <div style={{ color: EMERALD_ACCENT }}>{CORE_ICONS.Building("w-8 h-8")}</div>
        <div>
          <h4 className="text-2xl font-bold text-white leading-none">{stats.activeUnits}</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: LABEL_COLOR }}>Active Units</p>
        </div>
      </div>
      <div className="bg-[#1c1a19] p-8 rounded-2xl flex items-center space-x-5 border" style={{ borderColor: CARD_BORDER }}>
        <div style={{ color: EMERALD_ACCENT }}>{CORE_ICONS.Bookings("w-8 h-8")}</div>
        <div>
          <h4 className="text-2xl font-bold text-white leading-none">{stats.active}</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: LABEL_COLOR }}>Upcoming Stays</p>
        </div>
      </div>
      <div className="bg-[#1c1a19] p-8 rounded-2xl flex items-center space-x-5 border" style={{ borderColor: CARD_BORDER }}>
        <div style={{ color: EMERALD_ACCENT }}><History className="w-8 h-8" strokeWidth={1.5} /></div>
        <div>
          <h4 className="text-2xl font-bold text-white leading-none">{stats.past}</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: LABEL_COLOR }}>Completed Stays</p>
        </div>
      </div>
      <div className="bg-[#1c1a19] p-8 rounded-2xl flex items-center space-x-5 border" style={{ borderColor: CARD_BORDER }}>
        <div style={{ color: EMERALD_ACCENT }}>{CORE_ICONS.Dollar("w-8 h-8")}</div>
        <div>
          <h4 className="text-2xl font-bold text-white leading-none">${stats.revenueYear.toLocaleString()}</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: LABEL_COLOR }}>Annual Revenue</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
