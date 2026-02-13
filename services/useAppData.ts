
import { useState, useEffect, useCallback } from 'react';
import { UserRole, Host, Apartment, Booking, BlockedDate, User } from '../types';
import { sanctumApi } from './api';
import { checkSession, signInWithEmail, signOut } from './authService';
import { format } from 'date-fns';

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
            sanctumApi.getAllHosts(),
            sanctumApi.getAllApartments(),
            sanctumApi.getAllBookings(),
          ]);
          setHosts(allHosts);
          setApartments(allApartments);
          setBookings(allBookings);
        } else if (sessionUser.role === UserRole.HOST) {
          const hostData = await sanctumApi.getHostDashboardData();
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
          const guestData = await sanctumApi.getLandingData({ slug: hostSlug }, true);
          setCurrentHost(guestData.host);
          setApartments(guestData.apartments);
        } else {
          const publicHosts = await sanctumApi.getPublicHosts();
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

  const onToggleBlock = useCallback(async (apartmentId: string, date: Date) => {
    const dateToToggle = format(date, 'yyyy-MM-dd');

    const existingBlock = blockedDates.find(
      (blockedDate) =>
        blockedDate.apartmentId === apartmentId &&
        format(new Date(blockedDate.date), 'yyyy-MM-dd') === dateToToggle
    );

    const method = existingBlock ? 'DELETE' : 'POST';
    
    try {
        const response = await fetch('/api/v1/blocked-dates', {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([{ apartmentId, date: dateToToggle }])
        });

        if (!response.ok) {
            const res = await response.json();
            throw new Error(res.error || `Failed to ${method} blocked date`);
        }
        
        await loadApplicationData(false);
    } catch (err: any) {
        setError(err.message);
    }
  }, [blockedDates, loadApplicationData]);

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
    onToggleBlock,
    handleSeed: createApiHandler(sanctumApi.seedDatabase),
    handleAuth,
    handleLogout,
    handleHostChange,
    handleNewBooking: createApiHandler(sanctumApi.createBooking),
    handleUpdateBookings: createApiHandler(sanctumApi.updateBookings, { silent: true }),
    handleUpdateApartments: createApiHandler(sanctumApi.updateApartments, { silent: true }),
    handleUpdateHosts: createApiHandler(sanctumApi.updateHosts),
    handleBlockedDatesChange: () => loadApplicationData(false),
    loadingAirbnbIcal: false,
    currentHostAirbnbBlockedDates: [],
  };
};
