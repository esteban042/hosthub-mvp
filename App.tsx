import React, { useState, useEffect } from 'react';
import { UserRole, Host, Apartment, Booking, BlockedDate, User } from './types';
import { hostHubApi, fetchAndParseIcal } from './services/api';
import { GuestLandingPage } from './pages/GuestLandingPage';
import HostDashboard from './pages/HostDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ApartmentDetailPage from './pages/ApartmentDetailPage';
import { Layout } from './components/Layout';
import LoginPage from './pages/LoginPage';
import { Database, RefreshCcw, AlertTriangle } from 'lucide-react';
import { onAuthStateChange, signInWithEmail, signOut } from './services/authService';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentHost, setCurrentHost] = useState<Host | null>(null);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);
  const [currentHostAirbnbBlockedDates, setCurrentHostAirbnbBlockedDates] = useState<string[]>([]);
  const [loadingAirbnbIcal, setLoadingAirbnbIcal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // --- DATA FETCHING ---
  const fetchGuestData = async (slug?: string) => {
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

  const fetchHostData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const hostData = await hostHubApi.getHostDataByUserId(user.id);
      if (hostData) {
        setCurrentHost(hostData.host);
        setApartments(hostData.apartments);
        setBookings(hostData.bookings);
        setBlockedDates(hostData.blockedDates);
      }
      const allHosts = await hostHubApi.getAllHosts();
      setHosts(allHosts);
    } catch (err: any) {
      setError(err.message || "Failed to fetch host data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allHosts, allApartments, allBookings] = await Promise.all([
        hostHubApi.getAllHosts(),
        hostHubApi.getAllApartments(),
        hostHubApi.getAllBookings(),
      ]);
      setHosts(allHosts);
      setApartments(allApartments);
      setBookings(allBookings);
    } catch (err: any) {
      setError(err.message || "Failed to fetch admin data.");
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setCurrentHost(null);
    setApartments([]);
    setBookings([]);
    setBlockedDates([]);
    setError(null);
  };
  
  // --- AUTH & SESSION MANAGEMENT ---
  useEffect(() => {
    const unsubscribe = onAuthStateChange((authUser) => {
      setUser(authUser);
      if (authUser) {
        setShowLogin(false);
        if (authUser.role === UserRole.ADMIN) {
          fetchAdminData();
        } else if (authUser.role === UserRole.HOST) {
          fetchHostData();
        }
      } else {
        const params = new URLSearchParams(window.location.search);
        const hostSlug = params.get('host');
        fetchGuestData(hostSlug || undefined);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load Airbnb iCal
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
      await fetchGuestData(params.get('host') || undefined);
    } finally {
      setSeeding(false);
    }
  };

  const handleAuth = async (email: string, pass: string) => {
    const { error } = await signInWithEmail(email, pass);
    if (error) {
      alert(`Login Failed: ${error.message}`);
    }
  };

  const handleLogout = () => {
    signOut();
    clearData();
  };

  const handleHostChange = (slug: string) => {
    fetchGuestData(slug);
    setSelectedAptId(null);
  };

  // --- DATA MUTATIONS ---
  const handleNewBooking = async (newBooking: Booking) => {
    try {
      const createdBooking = await hostHubApi.createBooking(newBooking);
      const data = await hostHubApi.getLandingData(currentHost?.slug);
      setBookings(data.bookings);
      const bookedApartment = apartments.find(apt => apt.id === newBooking.apartmentId);
      if (currentHost && bookedApartment) {
        await hostHubApi.sendEmail(newBooking.guestEmail, `Booking Confirmed: ${bookedApartment.title}`, 'BookingConfirmed', createdBooking, bookedApartment, currentHost);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateBookings = async (updatedBookings: Booking[]) => {
    await hostHubApi.updateBookings(updatedBookings);
    if (user?.role === UserRole.HOST) {
        fetchHostData();
    }
  };

  const handleUpdateApartments = async (updatedApartments: Apartment[]) => {
    await hostHubApi.updateApartments(updatedApartments);
    if (user?.role === UserRole.HOST) {
        fetchHostData();
    }
  };

  const handleUpdateHosts = async (updatedHosts: Host[]) => {
    await hostHubApi.updateHosts(updatedHosts);
    fetchAdminData();
    if (user && user.role === UserRole.HOST) {
      const self = updatedHosts.find(h => h.id === user.id);
      if (self) setCurrentHost(self);
    }
  };

  const handleUpdateBlockedDates = async (updatedBlocked: BlockedDate[]) => {
    await hostHubApi.updateBlockedDates(updatedBlocked);
    setBlockedDates(updatedBlocked);
  };
  
  // --- UI RENDERING ---
  if (loading) return <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center space-y-4"><div className="w-12 h-12 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div><p className="text-stone-300 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Syncing HostHub Cluster...</p></div>;

  if (!currentHost && !user) return <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-6 text-center font-dm"><div className="w-24 h-24 bg-stone-900 border border-stone-800 rounded-[2rem] flex items-center justify-center mb-10"><Database className="w-10 h-10 text-emerald-400" /></div><h2 className="text-4xl font-serif font-bold text-white mb-4 tracking-tight">System Unprovisioned</h2><p className="text-stone-500 max-w-md mx-auto mb-12">No environment data found. Provision mock ecosystem to begin.</p>{error && <div className="mb-10 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center space-x-3 text-left max-w-lg mx-auto"><AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" /><p className="text-xs text-rose-400 font-medium">{error}</p></div>}<div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4"><button disabled={seeding} onClick={handleSeed} className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-full font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-emerald-500/20 flex items-center space-x-3">{seeding ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}<span>Provision Mock Data</span></button><button onClick={() => setShowLogin(true)} className="bg-transparent border border-stone-800 text-stone-400 hover:text-white hover:border-white px-10 py-5 rounded-full font-black text-[11px] uppercase tracking-widest transition-all">Access Admin Console</button></div></div>;

  const renderContent = () => {
    if (showLogin) return <LoginPage onLogin={handleAuth} />;

    if (user) {
        switch (user.role) {
            case UserRole.ADMIN: return <AdminDashboard hosts={hosts} apartments={apartments} bookings={bookings} onUpdateHosts={handleUpdateHosts} />;
            case UserRole.HOST: 
                if(currentHost) return <HostDashboard host={currentHost} apartments={apartments} bookings={bookings} blockedDates={blockedDates} onUpdateBookings={handleUpdateBookings} onUpdateBlockedDates={handleUpdateBlockedDates} onUpdateApartments={handleUpdateApartments} airbnbCalendarDates={currentHostAirbnbBlockedDates} loadingAirbnbIcal={loadingAirbnbIcal} />;
                return null; // or a loading/error state
            default: return null;
        }
    }

    if (selectedAptId && currentHost) {
        const apt = apartments.find(a => a.id === selectedAptId);
        if (apt) return <ApartmentDetailPage apartment={apt} host={currentHost} bookings={bookings} blockedDates={blockedDates} airbnbCalendarDates={currentHostAirbnbBlockedDates} onBack={() => setSelectedAptId(null)} onNewBooking={handleNewBooking} />;
    }

    if(currentHost) {
        return <GuestLandingPage host={currentHost} apartments={apartments} bookings={bookings} blockedDates={blockedDates} airbnbCalendarDates={currentHostAirbnbBlockedDates} onSelectApartment={(id) => setSelectedAptId(id)} onNewBooking={handleNewBooking} />;
    }

    return null;
  };

  return <Layout role={user?.role || UserRole.GUEST} onSignIn={() => setShowLogin(true)} currentHost={currentHost} allHosts={hosts} onHostChange={handleHostChange} user={user} onLogout={handleLogout}>{renderContent()}</Layout>;
};

export default App;
