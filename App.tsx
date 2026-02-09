
import React, { useState, useEffect } from 'react';
import { UserRole, Host, Apartment, Booking, BlockedDate, User, BookingStatus } from './types';
import { hostHubApi, fetchAndParseIcal } from './services/api';
import { GuestLandingPage } from './pages/GuestLandingPage';
import HostDashboard from './pages/HostDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ApartmentDetailPage from './pages/ApartmentDetailPage';
import { Layout } from './components/Layout';
import LoginPage from './pages/LoginPage';
import { Database, RefreshCcw, AlertTriangle } from 'lucide-react';

const ADMIN_EMAIL = 'admin@hosthub.com';
const ADMIN_PWD = 'admin123';
const DEFAULT_HOST_PWD = 'password123';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.GUEST);
  const [currentHost, setCurrentHost] = useState<Host | null>(null);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);
  const [currentHostAirbnbBlockedDates, setCurrentHostAirbnbBlockedDates] = useState<string[]>([]);
  const [loadingAirbnbIcal, setLoadingAirbnbIcal] = useState(false);

  const fetchData = async (slug?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await hostHubApi.getLandingData(slug);
      setCurrentHost(data.host);
      setApartments(data.apartments);
      setBookings(data.bookings);
      setBlockedDates(data.blockedDates);
      
      const allHosts = await hostHubApi.getAllHosts();
      setHosts(allHosts);
    } catch (err: any) {
      setError(err.message || "Connection failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Detect host from URL: ?host=slug
    const params = new URLSearchParams(window.location.search);
    const hostSlug = params.get('host');
    fetchData(hostSlug || undefined);
  }, []);

  useEffect(() => {
    const loadAirbnbIcal = async () => {
      if (currentHost?.airbnbCalendarLink) {
        setLoadingAirbnbIcal(true);
        try {
          const dates = await fetchAndParseIcal(currentHost.airbnbCalendarLink);
          setCurrentHostAirbnbBlockedDates(dates);
        } catch (error) {
          setCurrentHostAirbnbBlockedDates([]);
        } finally {
          setLoadingAirbnbIcal(false);
        }
      } else {
        setCurrentHostAirbnbBlockedDates([]);
      }
    };
    loadAirbnbIcal();
  }, [currentHost]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await hostHubApi.seedDatabase();
      const params = new URLSearchParams(window.location.search);
      await fetchData(params.get('host') || undefined);
    } finally {
      setSeeding(false);
    }
  };

  const handleAuth = (email: string, pass: string) => {
    if (email === ADMIN_EMAIL && pass === ADMIN_PWD) {
      setUser({ id: 'admin-1', email, name: 'Admin', role: UserRole.ADMIN, avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=200' });
      setCurrentRole(UserRole.ADMIN);
      return;
    }
    const matchingHost = hosts.find(h => email === `${h.slug}@host.com`);
    if (matchingHost && pass === DEFAULT_HOST_PWD) {
      setUser({ id: matchingHost.id, email, name: matchingHost.name, role: UserRole.HOST, avatar: matchingHost.avatar });
      setCurrentHost(matchingHost);
      setCurrentRole(UserRole.HOST);
      fetchData(matchingHost.slug);
      return;
    }
    alert('Invalid credentials.');
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
      const bookedApartment = apartments.find(apt => apt.id === newBooking.apartmentId);
      if (currentHost && bookedApartment) {
        await hostHubApi.sendEmail(newBooking.guestEmail, `Request received for ${bookedApartment.title}`, 'BookingRequestReceived', newBooking, bookedApartment, currentHost);
      }
    } catch (e) {
      console.error(e);
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

  if (loading) return <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center space-y-4"><div className="w-12 h-12 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div><p className="text-stone-300 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Syncing HostHub Cluster...</p></div>;

  if (!currentHost) return <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-6 text-center font-dm"><div className="w-24 h-24 bg-stone-900 border border-stone-800 rounded-[2rem] flex items-center justify-center mb-10"><Database className="w-10 h-10 text-emerald-400" /></div><h2 className="text-4xl font-serif font-bold text-white mb-4 tracking-tight">System Unprovisioned</h2><p className="text-stone-500 max-w-md mx-auto mb-12">No environment data found. Provision mock ecosystem to begin.</p>{error && <div className="mb-10 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center space-x-3 text-left max-w-lg mx-auto"><AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" /><p className="text-xs text-rose-400 font-medium">{error}</p></div>}<div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4"><button disabled={seeding} onClick={handleSeed} className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-full font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-emerald-500/20 flex items-center space-x-3">{seeding ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}<span>Provision Mock Data</span></button><button onClick={() => setCurrentRole(UserRole.ADMIN)} className="bg-transparent border border-stone-800 text-stone-400 hover:text-white hover:border-white px-10 py-5 rounded-full font-black text-[11px] uppercase tracking-widest transition-all">Access Admin Console</button></div></div>;

  const renderContent = () => {
    if (currentRole === UserRole.GUEST) {
      if (selectedAptId) {
        const apt = apartments.find(a => a.id === selectedAptId);
        if (apt) return <ApartmentDetailPage apartment={apt} host={currentHost} bookings={bookings} blockedDates={blockedDates} airbnbCalendarDates={currentHostAirbnbBlockedDates} onBack={() => setSelectedAptId(null)} onNewBooking={handleNewBooking} />;
      }
      return <GuestLandingPage host={currentHost} apartments={apartments} bookings={bookings} blockedDates={blockedDates} airbnbCalendarDates={currentHostAirbnbBlockedDates} onSelectApartment={(id) => setSelectedAptId(id)} onNewBooking={handleNewBooking} />;
    }
    if (!user) return <LoginPage onLogin={handleAuth} />;
    switch (currentRole) {
      case UserRole.ADMIN: return <AdminDashboard hosts={hosts} apartments={apartments} bookings={bookings} onUpdateHosts={handleUpdateHosts} />;
      case UserRole.HOST: return <HostDashboard host={currentHost} apartments={apartments} bookings={bookings} blockedDates={blockedDates} onUpdateBookings={handleUpdateBookings} onUpdateBlockedDates={handleUpdateBlockedDates} onUpdateApartments={handleUpdateApartments} airbnbCalendarDates={currentHostAirbnbBlockedDates} loadingAirbnbIcal={loadingAirbnbIcal} />;
      default: return null;
    }
  };

  return <Layout role={currentRole} setRole={setCurrentRole} currentHost={currentHost} allHosts={hosts} onHostChange={handleHostChange} user={user} onLogout={handleLogout}>{renderContent()}</Layout>;
};

export default App;
