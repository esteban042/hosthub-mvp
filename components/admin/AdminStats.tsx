import React, { useMemo } from 'react';
import { Host, Apartment, Booking, SubscriptionType, BookingStatus, SUBSCRIPTION_PRICES } from '../../types';
import { CreditCard, Percent, Globe, Layers } from 'lucide-react';
import StatCard from '../host-dashboard/StatCard';

interface AdminStatsProps {
  hosts: Host[];
  apartments: Apartment[];
  bookings: Booking[];
}

const AdminStats: React.FC<AdminStatsProps> = ({ hosts, apartments, bookings }) => {
  const stats = useMemo(() => {
    const monthlySubRev = hosts.reduce((acc, h) => acc + (SUBSCRIPTION_PRICES[h.subscriptionType] || 0), 0);
    const totalCommission = hosts.reduce((acc, h) => {
      const hostApts = apartments.filter(a => a.hostId === h.id && a.isActive).map(a => a.id);
      const hostVolume = bookings
        .filter(b => hostApts.includes(b.apartmentId) && (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID))
        .reduce((sum, b) => sum + b.totalPrice, 0);
      return acc + (hostVolume * (h.commissionRate / 100));
    }, 0);
    return {
      monthlySubscriptionRevenue: monthlySubRev,
      totalCommission,
      activeHosts: hosts.length,
      totalAssets: apartments.filter(a => a.isActive).length
    };
  }, [hosts, apartments, bookings]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      <StatCard
        icon={<CreditCard className="w-6 h-6" />}
        label="Monthly Subscription Revenue"
        value={`$${stats.monthlySubscriptionRevenue.toLocaleString()}`}
      />
      <StatCard
        icon={<Percent className="w-6 h-6" />}
        label="Platform Commission"
        value={`$${Math.round(stats.totalCommission).toLocaleString()}`}
      />
      <StatCard
        icon={<Globe className="w-6 h-6" />}
        label="Active Hosts"
        value={stats.activeHosts}
      />
      <StatCard
        icon={<Layers className="w-6 h-6" />}
        label="Asset Online"
        value={stats.totalAssets}
      />
    </div>
  );
};

export default AdminStats;
