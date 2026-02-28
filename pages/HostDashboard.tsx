import React, { useState, useMemo } from 'react';
import { Host, Apartment, Booking, BookingStatus, BlockedDate } from '../types.js';
import { fetchApi } from '../services/api.js';
import StatisticsDashboard from '../components/host-dashboard/StatisticsDashboard.js';
import DashboardHeader from '../components/host-dashboard/DashboardHeader.js';
import DashboardStats from '../components/host-dashboard/DashboardStats.js';
import DashboardNav from '../components/host-dashboard/DashboardNav.js';
import ApartmentEditor from '../components/host-dashboard/ApartmentEditor.js';
import ApartmentsList from '../components/host-dashboard/ApartmentsList.js';
import Bookings from '../components/host-dashboard/Bookings.js';
import CurrentBookings from '../components/host-dashboard/CurrentBookings.js';
import Calendar from '../components/host-dashboard/Calendar.js';
import AirbnbImportModal from '../components/host-dashboard/AirbnbImportModal.js';
import HostInfoEditor from '../components/host-dashboard/HostInfoEditor.js';

interface HostDashboardProps {
  host: Host;
  apartments: Apartment[];
  bookings: Booking[];
  blockedDates: BlockedDate[];
  onUpdateBookings: (bookings: Booking[]) => void;
  onBlockedDatesChange: () => void;
  onUpdateApartments: (apartments: Apartment[]) => void;
  onHostUpdate: (updatedHost: Host) => void;
  onImportListingFromAirbnb: (listingUrl: string) => void;
  loadingAirbnbIcal: boolean;
}

const HostDashboard: React.FC<HostDashboardProps> = ({ 
  host, apartments, bookings, blockedDates, onUpdateBookings, onBlockedDatesChange, onUpdateApartments, onHostUpdate, onImportListingFromAirbnb, loadingAirbnbIcal 
}) => {
  const [activeTab, setActiveTab] = useState<'current-bookings' | 'bookings' | 'calendar' | 'apartments'| 'statistics' | 'general-info'>('current-bookings');
  const [showAptModal, setShowAptModal] = useState<boolean>(false);
  const [editingApt, setEditingApt] = useState<Partial<Apartment> | null>(null);
  const [showAirbnbImportModal, setShowAirbnbImportModal] = useState<boolean>(false);

  const myApartments = useMemo(() => host ? apartments.filter(a => a.hostId === host.id) : [], [apartments, host]);
  const myBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter(b => 
      b && 
      typeof b.startDate === 'string' && 
      typeof b.endDate === 'string' &&
      myApartments.some(a => a.id === b.apartmentId)
    );
  }, [bookings, myApartments]);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleUpdateStatus = async (booking: Booking, status: BookingStatus) => {
    const updatedBooking = { ...booking, status };
    try {
      await fetchApi('/api/v1/bookings', {
        method: 'PUT',
        body: JSON.stringify([updatedBooking]),
      });
      onUpdateBookings(bookings.map(b => b.id === booking.id ? updatedBooking : b));
    } catch (error) {
      console.error("Failed to update booking status:", error);
    }
  };

  const stats = useMemo(() => {
    try {
      if (!host) return { activeUnits: 0, active: 0, past: 0, revenueYear: 0, totalPageViews: 0 };
      const currentYear = new Date().getFullYear();
      const activeUnits = myApartments.filter(a => a.isActive).length;

      const active = myBookings.filter(b => (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID) && b.endDate >= todayStr).length;
      const pastCount = myBookings.filter(b => b.endDate < todayStr).length;
      const revenueYear = myBookings
          .filter(b => (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID) && new Date(b.startDate).getFullYear() === currentYear)
          .reduce((sum, b) => sum + b.totalPrice, 0);
      const totalPageViews = myApartments.reduce((sum, apt) => sum + (apt.pageViews || 0), 0);
      return { activeUnits, active, past: pastCount, revenueYear, totalPageViews };
    } catch (error) {
        console.error("Error calculating stats:", error);
        return { activeUnits: 0, active: 0, past: 0, revenueYear: 0, totalPageViews: 0 };
    }
  }, [myBookings, myApartments, todayStr, host]);

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

  const handleSaveApartment = async (processedApt: Partial<Apartment>) => {
    if (!processedApt || !host) return;

    const apartmentData = {
      ...processedApt,
      hostId: host.id,
      amenities: processedApt.amenities || [],
      photos: processedApt.photos || ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800&h=600'],
      priceOverrides: processedApt.priceOverrides || [],
      isActive: processedApt.isActive === undefined ? true : processedApt.isActive,
    };

    try {
      if (apartmentData.id) {
        const updatedApt = await fetchApi(`/api/v1/apartments/${apartmentData.id}`, {
          method: 'PUT',
          body: JSON.stringify(apartmentData),
        });
        onUpdateApartments(apartments.map(a => a.id === updatedApt.id ? updatedApt as Apartment : a));
      } else {
        const { id, ...newAptPayload } = apartmentData;
        const newApt = await fetchApi('/api/v1/apartments', {
          method: 'POST',
          body: JSON.stringify(newAptPayload),
        });
        onUpdateApartments([...apartments, newApt as Apartment]);
      }

      setShowAptModal(false);
      setEditingApt(null);
    } catch (error) {
      console.error("Failed to save apartment:", error);
    }
  };

  if (!host) {
    return <div>Loading...</div>;
  }

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 animate-in fade-in duration-700 font-dm">
      <DashboardHeader 
        hostSlug={host.slug} 
        onAddUnit={() => { setEditingApt({}); setShowAptModal(true); }} 
        onImportFromAirbnb={() => setShowAirbnbImportModal(true)}
      />
      <DashboardStats stats={stats} />
      <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'current-bookings' && <CurrentBookings bookings={myBookings} apartments={myApartments} onUpdateStatus={handleUpdateStatus} />}
      {activeTab === 'bookings' && <Bookings bookings={myBookings} apartments={myApartments} host={host} onUpdateBooking={handleUpdateStatus} />}
      {activeTab === 'calendar' && <Calendar />}
      {activeTab === 'apartments' && <ApartmentsList apartments={myApartments} onConfigure={(apt) => { setEditingApt(apt); setShowAptModal(true); }} />}
      {activeTab === 'statistics' && <StatisticsDashboard myApartments={myApartments} myBookings={myBookings} />}
      {activeTab === 'general-info' && <HostInfoEditor host={host} onHostUpdate={onHostUpdate} />}

      {showAptModal && editingApt && (
        <ApartmentEditor 
          editingApt={editingApt} 
          host={host}
          onSave={handleSaveApartment} 
          onClose={() => { setShowAptModal(false); setEditingApt(null); }} 
        />
      )}

      {showAirbnbImportModal && (
        <AirbnbImportModal
          onClose={() => setShowAirbnbImportModal(false)}
          onImport={onImportListingFromAirbnb}
          loading={loadingAirbnbIcal}
        />
      )}
    </div>
  );
};

export default HostDashboard;
