import React from 'react';
import { CORE_ICONS, SKY_ACCENT } from '../../constants';
import { History, Eye } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    activeUnits: number;
    active: number;
    past: number;
    revenueYear: number;
    totalPageViews: number;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
      <div className="bg-white/50 p-8 rounded-2xl flex items-center space-x-5 border border-charcoal/30">
        <div style={{ color: SKY_ACCENT }}>{CORE_ICONS.Building("w-8 h-8")}</div>
        <div>
          <h4 className="text-2xl font-bold text-charcoal leading-none">{stats.activeUnits}</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-charcoal/60">Active Units</p>
        </div>
      </div>
      <div className="bg-white/50 p-8 rounded-2xl flex items-center space-x-5 border border-charcoal/30">
        <div style={{ color: SKY_ACCENT }}>{CORE_ICONS.Bookings("w-8 h-8")}</div>
        <div>
          <h4 className="text-2xl font-bold text-charcoal leading-none">{stats.active}</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-charcoal/60">Upcoming Stays</p>
        </div>
      </div>
      <div className="bg-white/50 p-8 rounded-2xl flex items-center space-x-5 border border-charcoal/70">
        <div style={{ color: SKY_ACCENT }}><History className="w-8 h-8" strokeWidth={1.5} /></div>
        <div>
          <h4 className="text-2xl font-bold text-charcoal leading-none">{stats.past}</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-charcoal/60">Completed Stays</p>
        </div>
      </div>
      <div className="bg-white/50 p-8 border border-gray-200 rounded-2xl flex items-center space-x-5 border border-charcoal/30">
        <div className="text-cyan-700">{CORE_ICONS.Dollar("w-8 h-8")}</div>
        <div>
          <h4 className="text-2xl font-bold text-charcoal leading-none">${stats.revenueYear.toLocaleString()}</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-charcoal/60">Annual Revenue</p>
        </div>
      </div>
      <div className="bg-white/50 p-8 border border-gray-200 rounded-2xl flex items-center space-x-5 border border-charcoal/30">
        <div className="text-cyan-700"><Eye className="w-8 h-8" /></div>
        <div>
          <h4 className="text-2xl font-bold text-charcoal leading-none">{stats.totalPageViews}</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-charcoal/60">Total Page Views</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
