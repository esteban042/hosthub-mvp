
import { Apartment, Booking, BookingStatus, Host, BlockedDate } from '../types';
import { MOCK_HOSTS, MOCK_APARTMENTS, MOCK_BOOKINGS } from '../mockData';

const STORAGE_KEY_HOSTS = 'hosthub_hosts_v2';
const STORAGE_KEY_BOOKINGS = 'hosthub_bookings_v2';
const STORAGE_KEY_APARTMENTS = 'hosthub_apartments_v2';
const STORAGE_KEY_BLOCKED = 'hosthub_blocked_v2';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStored = <T>(key: string, fallback: T): T => {
  const stored = localStorage.getItem(key);
  try {
    return stored ? JSON.parse(stored) : fallback;
  } catch (e) {
    return fallback;
  }
};

// Persistent singletons
let sessionHosts: Host[] = getStored(STORAGE_KEY_HOSTS, [...MOCK_HOSTS]);
let sessionApartments: Apartment[] = getStored(STORAGE_KEY_APARTMENTS, [...MOCK_APARTMENTS]);
let sessionBookings: Booking[] = getStored(STORAGE_KEY_BOOKINGS, [...MOCK_BOOKINGS]);
let sessionBlockedDates: BlockedDate[] = getStored(STORAGE_KEY_BLOCKED, []);

const commitToDisk = () => {
  localStorage.setItem(STORAGE_KEY_HOSTS, JSON.stringify(sessionHosts));
  localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(sessionBookings));
  localStorage.setItem(STORAGE_KEY_APARTMENTS, JSON.stringify(sessionApartments));
  localStorage.setItem(STORAGE_KEY_BLOCKED, JSON.stringify(sessionBlockedDates));
  console.log("HostHub DB Sync: Successfully committed to localStorage");
};

export const hostHubApi = {
  async getLandingData(slug?: string): Promise<{ host: Host; apartments: Apartment[]; bookings: Booking[]; blockedDates: BlockedDate[] }> {
    await delay(150);
    
    const host = sessionHosts.find(h => h.slug === slug) || 
                 sessionHosts.find(h => h.slug === window.location.hostname.split('.')[0]) || 
                 sessionHosts[0];
    
    if (!host) throw new Error("Critical: No hosts available in database.");

    const apartments = sessionApartments.filter(a => a.hostId === host.id);
    const apartmentIds = apartments.map(a => a.id);
    const bookings = sessionBookings.filter(b => apartmentIds.includes(b.apartmentId));
    const blockedDates = sessionBlockedDates.filter(d => apartmentIds.includes(d.apartmentId) || d.apartmentId === 'all');
    
    return {
      host,
      apartments,
      bookings,
      blockedDates
    };
  },

  async getAllHosts(): Promise<Host[]> {
    return [...sessionHosts];
  },

  async createBooking(data: Partial<Booking>): Promise<Booking> {
    await delay(300);
    const newBooking = {
      ...data,
      id: data.id || `book-local-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: data.status || BookingStatus.REQUESTED,
      isDepositPaid: data.isDepositPaid ?? false
    } as Booking;
    
    sessionBookings.push(newBooking);
    commitToDisk();
    return newBooking;
  },

  async updateHosts(updatedList: Host[]): Promise<Host[]> {
    if (!updatedList || updatedList.length === 0) return sessionHosts;
    sessionHosts = updatedList;
    commitToDisk();
    return sessionHosts;
  },

  async updateApartments(updatedList: Apartment[]): Promise<Apartment[]> {
    if (!updatedList || updatedList.length === 0) return sessionApartments;
    const updatedIds = updatedList.map(u => u.id);
    sessionApartments = [
      ...sessionApartments.filter(sa => !updatedIds.includes(sa.id)),
      ...updatedList
    ];
    commitToDisk();
    return sessionApartments;
  },

  async updateBookings(updatedList: Booking[]): Promise<Booking[]> {
    if (!updatedList || updatedList.length === 0) return sessionBookings;
    const updatedIds = updatedList.map(u => u.id);
    sessionBookings = [
      ...sessionBookings.filter(sb => !updatedIds.includes(sb.id)),
      ...updatedList
    ];
    commitToDisk();
    return sessionBookings;
  },

  async updateBlockedDates(updatedList: BlockedDate[]): Promise<BlockedDate[]> {
    sessionBlockedDates = updatedList;
    commitToDisk();
    return sessionBlockedDates;
  }
};
