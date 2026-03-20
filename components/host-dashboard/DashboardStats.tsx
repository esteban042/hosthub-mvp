import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
      <StatCard
        icon={CORE_ICONS.Building("w-8 h-8")}
        label={t('host_dashboard.stats.active_units')}
        value={stats.activeUnits}
      />
      <StatCard
        icon={CORE_ICONS.Bookings("w-8 h-8")}
        label={t('host_dashboard.stats.upcoming_stays')}
        value={stats.active}
      />
      <StatCard
        icon={<History className="w-8 h-8" strokeWidth={1.5} />}
        label={t('host_dashboard.stats.completed_stays')}
        value={stats.past}
      />
      <StatCard
        icon={CORE_ICONS.Dollar("w-8 h-8")}
        label={t('host_dashboard.stats.annual_revenue')}
        value={`${stats.revenueYear.toLocaleString()}`}
      />
      <StatCard
        icon={<Eye className="w-8 h-8" />}
        label={t('host_dashboard.stats.total_page_views')}
        value={stats.totalPageViews}
      />
    </div>
  );
};

export default DashboardStats;
