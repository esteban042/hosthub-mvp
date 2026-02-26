import React from 'react';
import { CORE_ICONS } from '../../constants';
import { History, Eye } from 'lucide-react';
import StatCard from './StatCard';

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
      <StatCard
        icon={CORE_ICONS.Building("w-8 h-8")}
        label="Active Units"
        value={stats.activeUnits}
      />
      <StatCard
        icon={CORE_ICONS.Bookings("w-8 h-8")}
        label="Upcoming Stays"
        value={stats.active}
      />
      <StatCard
        icon={<History className="w-8 h-8" strokeWidth={1.5} />}
        label="Completed Stays"
        value={stats.past}
      />
      <StatCard
        icon={CORE_ICONS.Dollar("w-8 h-8")}
        label="Annual Revenue"
        value={`$${stats.revenueYear.toLocaleString()}`}
      />
      <StatCard
        icon={<Eye className="w-8 h-8" />}
        label="Total Page Views"
        value={stats.totalPageViews}
      />
    </div>
  );
};

export default DashboardStats;
