import { useState, useEffect, useCallback } from 'react';
import { UserRole, Host, Apartment, Booking, BlockedDate, User } from '../types';
import { hostHubApi } from './api';
import { checkSession, signInWithEmail, signOut } from './authService';

export const useAppData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentHost, setCurrentHost] = useState<Host | null>(null);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);

  const loadApplicationData = useCallback(async (showLoadingScreen = true) => {
    if (showLoadingScreen) {
      setLoading(true);
    }
    setError(null);

    try {
      const { user: sessionUser } = await checkSession();
      setUser(sessionUser);

      if (sessionUser) {
        if (sessionUser.role === UserRole.ADMIN) {
          const [allHosts, allApartments, allBookings] = await Promise.all([
            hostHubApi.getAllHosts(),
            hostHubApi.getAllApartments(),
            hostHubApi.getAllBookings(),
          ]);
          setHosts(allHosts);
          setApartments(allApartments);
          setBookings(allBookings);
        } else if (sessionUser.role === UserRole.HOST) {
          const hostData = await hostHubApi.getHostDashboardData();
          if (hostData && hostData.host) {
            setCurrentHost(hostData.host);
            setApartments(hostData.apartments || []);
            setBookings(hostData.bookings || []);
            setBlockedDates(hostData.blockedDates || []);
          } else if (!showLoadingScreen) {
            console.error("Background refresh of host data failed. UI state preserved.");
          } else {
            throw new Error("Failed to load essential host data.");
          }
        }
      } else {
        const params = new URLSearchParams(window.location.search);
        const hostSlug = params.get('host');
        if (hostSlug) {
          const guestData = await hostHubApi.getLandingData({ slug: hostSlug }, true);
          setCurrentHost(guestData.host);
          setApartments(guestData.apartments);
        } else {
          const publicHosts = await hostHubApi.getPublicHosts();
          setHosts(publicHosts as Host[]);
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      if (showLoadingScreen) {
          setUser(null);
      }
    } finally {
      if (showLoadingScreen) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadApplicationData();
  }, [loadApplicationData]);

  const handleAuth = async (email: string, pass: string): Promise<string | null> => {
    const { user, error } = await signInWithEmail(email, pass);
    if (error) {
      return error;
    }
    if (user) {
      window.location.reload();
    }
    return null;
  };

  const handleLogout = async () => {
    await signOut();
    window.location.assign('/');
  };

  const handleHostChange = (slug: string) => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('host', slug);
    window.history.pushState({}, '', newUrl);
    loadApplicationData();
  };
  
  const createApiHandler = (apiCall: (data?: any) => Promise<any>, options: { silent?: boolean } = {}) => async (data?: any) => {
    try {
      await apiCall(data);
      await loadApplicationData(!options.silent);
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  return {
    loading,
    error,
    seeding,
    user,
    currentHost,
    hosts,
    apartments,
    bookings,
    blockedDates,
    handleSeed: createApiHandler(hostHubApi.seedDatabase),
    handleAuth,
    handleLogout,
    handleHostChange,
    handleNewBooking: createApiHandler(hostHubApi.createBooking),
    handleUpdateBookings: createApiHandler(hostHubApi.updateBookings, { silent: true }),
    handleUpdateApartments: createApiHandler(hostHubApi.updateApartments, { silent: true }),
    handleUpdateHosts: createApiHandler(hostHubApi.updateHosts),
    handleBlockedDatesChange: () => loadApplicationData(false),
    loadingAirbnbIcal: false,
    currentHostAirbnbBlockedDates: [],
  };
};
