
import React, { useState, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserRole } from './types';
import { useAppData } from './services/useAppData';
import { GuestLandingPage } from './pages/GuestLandingPage';
import HostDashboard from './pages/HostDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ApartmentDetailPage from './pages/ApartmentDetailPage';
import PrintableBooking from './components/PrintableBooking';
import { Layout } from './components/Layout';
import LoginPage from './pages/LoginPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import BookingCancelPage from './pages/BookingCancelPage';
import { Database, RefreshCcw, AlertTriangle } from 'lucide-react';
import GenericLandingPage from './components/GenericLandingPage';

document.title = "Sanctum";

const App: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);

  const {
    loading,
    error,
    seeding,
    user,
    currentHost,
    hosts,
    apartments,
    bookings,
    blockedDates,
    currentHostAirbnbBlockedDates,
    loadingAirbnbIcal,
    handleSeed,
    handleAuth,
    handleLogout,
    handleHostChange,
    handleNewBooking,
    handleUpdateBookings,
    handleUpdateApartments,
    handleUpdateHosts,
    handleBlockedDatesChange,
  } = useAppData();

  const onLogout = async () => {
    const slug = currentHost?.slug;
    await handleLogout();
    if (slug) {
      window.location.href = `/?host=${slug}`;
    } else {
      window.location.href = '/';
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    const authError = await handleAuth(email, pass);
    if (authError) {
      return authError;
    } else {
      setShowLogin(false);
      return null;
    }
  };

  const formattedBlockedDates = useMemo(() => {
    return blockedDates.map(d => ({ ...d, date: d.date.split('T')[0] }));
  }, [blockedDates]);

  const formattedBookings = useMemo(() => {
    return bookings.map(b => ({ ...b, startDate: b.startDate.split('T')[0], endDate: b.endDate.split('T')[0] }));
  }, [bookings]);

  const renderInitialSetup = () => {
    if (user || currentHost || loading) return null;
    const params = new URLSearchParams(window.location.search);
    if (params.get('host')) return null;

    if (hosts.length > 0) {
      return <GenericLandingPage hosts={hosts} onHostChange={handleHostChange} onSignIn={() => setShowLogin(true)} />;
    }

    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-6 text-center font-dm">
        <div className="w-24 h-24 bg-stone-900 border border-stone-800 rounded-[2rem] flex items-center justify-center mb-10"><Database className="w-10 h-10 text-emerald-400" /></div>
        <h2 className="text-4xl font-serif font-bold text-white mb-4 tracking-tight">System Unprovisioned</h2>
        <p className="text-stone-500 max-w-md mx-auto mb-12">No environment data found. Select a host or provision mock ecosystem to begin.</p>
        {error && <div className="mb-10 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center space-x-3 text-left max-w-lg mx-auto"><AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" /><p className="text-xs text-rose-400 font-medium">{error}</p></div>}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button disabled={seeding} onClick={handleSeed} className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-full font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-emerald-500/20 flex items-center space-x-3">{seeding ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}<span>Provision Mock Data</span></button>
          <button onClick={() => setShowLogin(true)} className="bg-transparent border border-stone-800 text-stone-400 hover:text-white hover:border-white px-10 py-5 rounded-full font-black text-[11px] uppercase tracking-widest transition-all">Access Admin Console</button>
        </div>
      </div>
    );
  };

  const AppContent = () => {
    const initialSetup = renderInitialSetup();
    if (initialSetup) {
        if (showLogin) {
            return (
                <>
                    {initialSetup}
                    <LoginPage onLogin={handleLogin} onCancel={() => setShowLogin(false)} />
                </>
            )
        }
        return initialSetup;
    }

    const renderContent = () => {
        if (showLogin) return <LoginPage onLogin={handleLogin} onCancel={() => setShowLogin(false)} />;

        if (user) {
        switch (user.role) {
            case UserRole.ADMIN:
            return <AdminDashboard hosts={hosts} apartments={apartments} bookings={bookings} onUpdateHosts={handleUpdateHosts} onUpdateApartments={handleUpdateApartments} />;
            case UserRole.HOST:
            if (loading) return <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center space-y-4"><div className="w-12 h-12 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div><p className="text-stone-300 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Loading Host Dashboard...</p></div>;
            if (error && !currentHost) {
                return <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-6 text-center font-dm">
                <div className="w-24 h-24 bg-stone-900 border border-stone-800 rounded-[2rem] flex items-center justify-center mb-10"><AlertTriangle className="w-10 h-10 text-rose-400" /></div>
                <h2 className="text-4xl font-serif font-bold text-white mb-4 tracking-tight">Host Data Unavailable</h2>
                <p className="text-stone-500 max-w-md mx-auto mb-12">{error}</p>
                <button onClick={onLogout} className="bg-transparent border border-stone-800 text-stone-400 hover:text-white hover:border-white px-10 py-5 rounded-full font-black text-[11px] uppercase tracking-widest transition-all">Logout</button>
                </div>;
            }
            if (currentHost) return <HostDashboard host={currentHost} apartments={apartments} bookings={formattedBookings} blockedDates={formattedBlockedDates} onUpdateBookings={handleUpdateBookings} onBlockedDatesChange={handleBlockedDatesChange} onUpdateApartments={handleUpdateApartments} onHostUpdate={(updatedHost) => handleUpdateHosts(hosts.map(h => h.id === updatedHost.id ? updatedHost : h))} airbnbCalendarDates={currentHostAirbnbBlockedDates} loadingAirbnbIcal={loadingAirbnbIcal} />;
            return null;
            default:
            return <p>Unknown user role.</p>;
        }
        }

        if (selectedAptId && currentHost) {
          const apt = apartments.find(a => a.id === selectedAptId);
          if (apt) return <ApartmentDetailPage apartment={apt} host={currentHost} bookings={formattedBookings} blockedDates={formattedBlockedDates} airbnbCalendarDates={currentHostAirbnbBlockedDates} onBack={() => setSelectedAptId(null)} onNewBooking={handleNewBooking} />;
        }

        if (currentHost) {
        return <GuestLandingPage host={currentHost} apartments={apartments} bookings={formattedBookings} blockedDates={formattedBlockedDates} airbnbCalendarDates={currentHostAirbnbBlockedDates} onSelectApartment={(id) => setSelectedAptId(id)} onNewBooking={handleNewBooking}/>;
        }

        return null;
    };

    return <Layout role={user?.role || UserRole.GUEST} onSignIn={() => setShowLogin(true)} currentHost={currentHost} allHosts={hosts} onHostChange={handleHostChange} user={user} onLogout={onLogout}>{renderContent()}</Layout>;
    }

  if (loading && !user && !currentHost && hosts.length === 0) {
    return <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center space-y-4"><div className="w-12 h-12 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div><p className="text-stone-300 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Syncing Sanctum Cluster...</p></div>;
  }


  return (
    <Routes>
      <Route path="/booking/success" element={<BookingSuccessPage />} />
      <Route path="/booking/cancel" element={<BookingCancelPage />} />
      <Route path="/booking/print/:bookingId" element={<PrintableBooking />} />
      <Route path="/*" element={<AppContent />} />
    </Routes>
  )

}

export default App;
