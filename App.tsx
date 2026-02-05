import React, { useState, useEffect } from 'react';
import { UserRole, Host, Apartment, Booking, BlockedDate, User } from './types';
import { hostHubApi } from './services/api';
import { GuestLandingPage } from './pages/GuestLandingPage';
import HostDashboard from './pages/HostDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ApartmentDetailPage from './pages/ApartmentDetailPage';
import { Layout } from './components/Layout';
import LoginPage from './pages/LoginPage';

const ADMIN_EMAIL = 'admin@hosthub.com';
const ADMIN_PWD = 'admin123';
const DEFAULT_HOST_PWD = 'password123';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.GUEST);
  const [currentHost, setCurrentHost] = useState<Host | null>(null);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);

  const fetchData = async (slug?: string) => {
    setLoading(true);
    try {
      const data = await hostHubApi.getLandingData(slug);
      setCurrentHost(data.host);
      setApartments(data.apartments);
      setBookings(data.bookings);
      setBlockedDates(data.blockedDates);
      
      const allHosts = await hostHubApi.getAllHosts();
      setHosts(allHosts);
    } catch (err) {
      console.error("Data Sync Failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAuth = (email: string, pass: string) => {
    // 1. Check Admin
    if (email === ADMIN_EMAIL && pass === ADMIN_PWD) {
      const adminUser: User = { id: 'admin-1', email, name: 'Platform Admin', role: UserRole.ADMIN, avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=200&h=200' };
      setUser(adminUser);
      setCurrentRole(UserRole.ADMIN);
      return;
    }

    // 2. Check Hosts
    const matchingHost = hosts.find(h => email === `${h.slug}@host.com`);
    if (matchingHost && pass === DEFAULT_HOST_PWD) {
      const hostUser: User = { id: matchingHost.id, email, name: matchingHost.name, role: UserRole.HOST, avatar: matchingHost.avatar };
      setUser(hostUser);
      setCurrentHost(matchingHost);
      setCurrentRole(UserRole.HOST);
      // Re-fetch data for this specific host context
      fetchData(matchingHost.slug);
      return;
    }

    alert('Invalid credentials. Check the documentation for test accounts.');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentRole(UserRole.GUEST);
  };

  const handleHostChange = (slug: string) => {
    fetchData(slug);
    setSelectedAptId(null);
  };

  const handleNewBooking = async (newBooking: Booking) => {
    try {
      await hostHubApi.createBooking(newBooking);
      const data = await hostHubApi.getLandingData(currentHost?.slug);
      setBookings(data.bookings);
    } catch (e) {
      console.error("Booking Creation Failed:", e);
    }
  };

  const handleUpdateBookings = async (updatedBookings: Booking[]) => {
    await hostHubApi.updateBookings(updatedBookings);
    const data = await hostHubApi.getLandingData(currentHost?.slug);
    setBookings(data.bookings);
  };

  const handleUpdateApartments = async (updatedApartments: Apartment[]) => {
    await hostHubApi.updateApartments(updatedApartments);
    const data = await hostHubApi.getLandingData(currentHost?.slug);
    setApartments(data.apartments);
  };

  const handleUpdateHosts = async (updatedHosts: Host[]) => {
    await hostHubApi.updateHosts(updatedHosts);
    const allHosts = await hostHubApi.getAllHosts();
    setHosts(allHosts);
    
    // If we're an admin, we stay in admin role. 
    // If we were a host and our own info changed, we might need to update currentHost.
    if (user && user.role === UserRole.HOST) {
      const self = allHosts.find(h => h.id === user.id);
      if (self) setCurrentHost(self);
    }
  };

  const handleUpdateBlockedDates = async (updatedBlocked: BlockedDate[]) => {
    await hostHubApi.updateBlockedDates(updatedBlocked);
    const data = await hostHubApi.getLandingData(currentHost?.slug);
    setBlockedDates(data.blockedDates);
  };

  if (loading || !currentHost) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-700/10 border-t-amber-700 rounded-full animate-spin"></div>
        <p className="text-stone-300 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Syncing Boutique Cluster...</p>
      </div>
    );
  }

  const renderContent = () => {
    if (currentRole === UserRole.GUEST) {
      if (selectedAptId) {
        const apt = apartments.find(a => a.id === selectedAptId);
        if (apt) {
          return (
            <ApartmentDetailPage 
              apartment={apt} host={currentHost}
              bookings={bookings} blockedDates={blockedDates}
              onBack={() => setSelectedAptId(null)}
              onNewBooking={handleNewBooking}
            />
          );
        }
      }
      return (
        <GuestLandingPage 
          host={currentHost} apartments={apartments}
          bookings={bookings} blockedDates={blockedDates}
          onSelectApartment={(id) => setSelectedAptId(id)}
          onNewBooking={handleNewBooking}
        />
      );
    }

    if (!user) return <LoginPage onLogin={handleAuth} />;

    switch (currentRole) {
      case UserRole.ADMIN:
        return <AdminDashboard hosts={hosts} apartments={apartments} bookings={bookings} onUpdateHosts={handleUpdateHosts} />;
      case UserRole.HOST:
        return (
          <HostDashboard 
            host={currentHost} apartments={apartments}
            bookings={bookings} blockedDates={blockedDates}
            onUpdateBookings={handleUpdateBookings}
            onUpdateBlockedDates={handleUpdateBlockedDates}
            onUpdateApartments={handleUpdateApartments}
          />
        );
      default: return null;
    }
  };

  return (
    <Layout 
      role={currentRole} setRole={setCurrentRole} 
      currentHost={currentHost} allHosts={hosts}
      onHostChange={handleHostChange}
      user={user} onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
