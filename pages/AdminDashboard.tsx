
import React, { useState, useMemo } from 'react';
import { Host, Apartment, Booking, BookingStatus } from '../types';
import { Plus } from 'lucide-react';
import { sanctumApi as api } from '../services/api';
import AdminStats from '../components/admin/AdminStats';
import HostsGrid from '../components/admin/HostsGrid';
import HostConfigurationModal from '../components/admin/HostConfigurationModal';

interface AdminDashboardProps {
  hosts: Host[];
  apartments: Apartment[];
  bookings: Booking[];
  onUpdateHosts: (hosts: Host[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  hosts, apartments, bookings, onUpdateHosts
}) => {
  const [showHostModal, setShowHostModal] = useState(false);
  const [editingHost, setEditingHost] = useState<Partial<Host> | null>(null);

  const monthlyStats = useMemo(() => {
    if (!editingHost || !editingHost.id) return [];

    const hostBookings = bookings.filter(b => {
      const apartment = apartments.find(a => a.id === b.apartmentId);
      return apartment && apartment.hostId === editingHost.id && (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID);
    });

    const statsByMonth: { [key: string]: { bookings: number; commission: number } } = {};

    hostBookings.forEach(b => {
      const month = new Date(b.startDate).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!statsByMonth[month]) {
        statsByMonth[month] = { bookings: 0, commission: 0 };
      }
      statsByMonth[month].bookings += 1;
      statsByMonth[month].commission += b.totalPrice * ((editingHost.commissionRate || 0) / 100);
    });

    return Object.entries(statsByMonth).map(([month, data]) => ({
      month,
      ...data
    })).sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());

  }, [editingHost, bookings, apartments]);

  const handleSaveHost = async (hostToSave: Partial<Host>) => {
    try {
      if (hostToSave.id) {
        // For now, we continue to update the host on the client-side.
        // A follow-up action will be to move this to a PUT request.
        onUpdateHosts(hosts.map(h => h.id === hostToSave.id ? { ...h, ...hostToSave } as Host : h));
      } else {
        const hostToCreate = {
          name: hostToSave.name || 'New Elite Host',
          slug: hostToSave.slug?.toLowerCase().replace(/\s+/g, '-') || `new-host-${Math.random().toString(36).substr(2, 5)}`,
          ...hostToSave,
        };
        
        const { data: newHost } = await api.post('/api/hosts', hostToCreate);
        onUpdateHosts([...hosts, newHost]);
      }
      setShowHostModal(false);
      setEditingHost(null);
    } catch (error) {
      console.error('Failed to save host:', error);
      // Here you could add a state to show an error message to the user
    }
  };

  const handleConfigureHost = (host: Host) => {
    setEditingHost(host);
    setShowHostModal(true);
  };

  const handleCloseModal = () => {
    setShowHostModal(false);
    setEditingHost(null);
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 animate-in fade-in duration-1000 font-dm text-left">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Global Administration</h1>
          <p className="text-coral-500 font-bold uppercase tracking-[0.3em] text-[10px]">Platform HQ</p>
        </div>
        <button 
          onClick={() => { setEditingHost({ premiumConfig: { isEnabled: false, images: [], sections: [] } }); setShowHostModal(true); }}
          className="bg-transparent text-white border border-white px-10 py-5 rounded-2xl font-black text-[11px] tracking-widest transition-all hover:border-emerald-600 hover:text-emerald-600 flex items-center space-x-3 active:scale-95"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          <span>Onboard Host</span>
        </button>
      </div>

      <AdminStats hosts={hosts} apartments={apartments} bookings={bookings} />

      <HostsGrid 
        hosts={hosts} 
        apartments={apartments} 
        bookings={bookings} 
        onConfigureHost={handleConfigureHost} 
      />

      <HostConfigurationModal 
        isOpen={showHostModal}
        onClose={handleCloseModal}
        onSave={handleSaveHost}
        initialHost={editingHost}
        monthlyStats={monthlyStats}
      />
    </div>
  );
};

export default AdminDashboard;
