import React, { useState, useMemo } from 'react';
import { Host, Apartment, Booking, BookingStatus, BlockedDate } from '../types';
import { fetchApi } from '../services/api';
import StatisticsDashboard from '../components/StatisticsDashboard';

import DashboardHeader from '../components/host-dashboard/DashboardHeader';
import DashboardStats from '../components/host-dashboard/DashboardStats';
import DashboardNav from '../components/host-dashboard/DashboardNav';
import ApartmentEditor from '../components/host-dashboard/ApartmentEditor';
import ApartmentsList from '../components/host-dashboard/ApartmentsList';
import Bookings from '../components/host-dashboard/Bookings';
import CurrentBookings from '../components/host-dashboard/CurrentBookings';
import Calendar from '../components/host-dashboard/Calendar';

interface HostDashboardProps {
  host: Host;
  apartments: Apartment[];
  bookings: Booking[];
  blockedDates: BlockedDate[];
  onUpdateBookings: (bookings: Booking[]) => void;
  onBlockedDatesChange: () => void;
  onUpdateApartments: (apartments: Apartment[]) => void;
  airbnbCalendarDates: string[]; 
  loadingAirbnbIcal: boolean; 
}

const HostDashboard: React.FC<HostDashboardProps> = ({ 
  host, apartments, bookings, blockedDates, onUpdateBookings, onBlockedDatesChange, onUpdateApartments, airbnbCalendarDates, loadingAirbnbIcal
}) => {
  const [activeTab, setActiveTab] = useState<'current-bookings' | 'bookings' | 'calendar' | 'apartments'| 'statistics'>('current-bookings');
  const [showAptModal, setShowAptModal] = useState<boolean>(false);
  const [editingApt, setEditingApt] = useState<Partial<Apartment> | null>(null);

  const myApartments = useMemo(() => apartments.filter(a => a.hostId === host.id), [apartments, host.id]);
  const myBookings = useMemo(() => bookings.filter(b => myApartments.some(a => a.id === b.apartmentId)), [bookings, myApartments]);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleUpdateStatus = async (booking: Booking, status: BookingStatus) => {
    const updatedBooking = { ...booking, status };
    onUpdateBookings(bookings.map(b => b.id === booking.id ? updatedBooking : b));
  };

  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const activeUnits = myApartments.filter(a => a.isActive).length;

    const active = myBookings.filter(b => (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID) && b.endDate >= todayStr).length;
    const pastCount = myBookings.filter(b => b.endDate < todayStr).length;
    const revenueYear = myBookings
        .filter(b => (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID) && new Date(b.startDate).getFullYear() === currentYear)
        .reduce((sum, b) => sum + b.totalPrice, 0);
    return { activeUnits, active, past: pastCount, revenueYear };
  }, [myBookings, myApartments, todayStr]);

  const toggleManualBlock = async (aptId: string, date: string) => {
    const existing = blockedDates.find(d => d.apartmentId === aptId && d.date === date);
    
    try {
      if (existing) {
        await fetchApi('/api/v1/blocked-dates', {
          method: 'DELETE',
          body: JSON.stringify([existing]),
        });
      } else {
        await fetchApi('/api/v1/blocked-dates', {
          method: 'POST',
          body: JSON.stringify([{ apartmentId: aptId, date }]),
        });
      }
      onBlockedDatesChange();
    } catch (error) {
      console.error("Failed to toggle blocked date:", error);
    }
  };

  const handleSaveApartment = (processedApt: Partial<Apartment>) => {
    if (!processedApt) return;

    if (!processedApt.amenities) processedApt.amenities = [];
    if (!processedApt.photos) processedApt.photos = ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800&h=600'];
    if (!processedApt.priceOverrides) processedApt.priceOverrides = [];

    if (processedApt.id) {
      onUpdateApartments(myApartments.map(a => a.id === processedApt.id ? { ...a, ...processedApt } as Apartment : a));
    } else {
      const newApt: Apartment = {
        ...processedApt,
        id: `apt-${Date.now()}`,
        hostId: host.id,
        capacity: processedApt.capacity || 2,
        beds: processedApt.beds || 1,
        bathrooms: processedApt.bathrooms || 1,
        pricePerNight: processedApt.pricePerNight || 100,
        title: processedApt.title || 'Untitled sanctuary',
        description: processedApt.description || '',
        city: processedApt.city || '',
        isActive: true,
      } as Apartment;
      onUpdateApartments([...apartments, newApt]);
    }
    setShowAptModal(false);
    setEditingApt(null);
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 animate-in fade-in duration-700 font-dm">
      <DashboardHeader hostSlug={host.slug} onAddUnit={() => { setEditingApt({}); setShowAptModal(true); }} />
      <DashboardStats stats={stats} />
      <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'current-bookings' && <CurrentBookings bookings={myBookings} apartments={myApartments} onUpdateStatus={handleUpdateStatus} />}
      {activeTab === 'bookings' && <Bookings bookings={myBookings} apartments={myApartments} host={host} onUpdateBooking={handleUpdateStatus} />}
      {activeTab === 'calendar' && <Calendar apartments={myApartments} bookings={bookings} blockedDates={blockedDates} airbnbCalendarDates={airbnbCalendarDates} loadingIcal={loadingIcal} onToggleBlock={toggleManualBlock} />}
      {activeTab === 'apartments' && <ApartmentsList apartments={myApartments} onConfigure={(apt) => { setEditingApt(apt); setShowAptModal(true); }} />}
      {activeTab === 'statistics' && (
        <div className="bg-sky-700 border border-zinc-800 rounded-2xl p-8">
          <StatisticsDashboard myApartments={myApartments} myBookings={myBookings} />
        </div>
      )}

      {showAptModal && editingApt && (
        <ApartmentEditor 
          editingApt={editingApt} 
          onSave={handleSaveApartment} 
          onClose={() => { setShowAptModal(false); setEditingApt(null); }} 
        />
      )}
    </div>
  );
};

export default HostDashboard;
