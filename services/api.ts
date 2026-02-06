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
    console.warn(`Failed to parse stored data for ${key}. Using fallback.`, e);
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

/**
 * Simulated iCal parser
 * In a real application, you'd use a library like ical.js and fetch the URL.
 * For this exercise, we'll return a hardcoded set of blocked dates.
 */
export const fetchAndParseIcal = async (icalUrl: string): Promise<string[]> => {
  console.log(`Simulating fetching and parsing iCal from: ${icalUrl}`);
  await delay(800); // Simulate network delay
  
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  // Generate some dummy blocked dates for the current and next month
  const dummyBlockedDates: string[] = [];
  // Block 3 days in current month
  for (let i = 0; i < 3; i++) {
    const day = Math.floor(Math.random() * 20) + 1; // Random day in first 20 days
    dummyBlockedDates.push(new Date(year, month, day).toISOString().split('T')[0]);
  }
  // Block 2 days in next month
  for (let i = 0; i < 2; i++) {
    const day = Math.floor(Math.random() * 20) + 1; // Random day in first 20 days
    dummyBlockedDates.push(new Date(year, month + 1, day).toISOString().split('T')[0]);
  }

  return Array.from(new Set(dummyBlockedDates)); // Ensure unique dates
};


export const hostHubApi = {
  async getLandingData(slug?: string): Promise<{ host: Host; apartments: Apartment[]; bookings: Booking[]; blockedDates: BlockedDate[] }> {
    await delay(150);
    
    // Attempt to find host by slug (from URL), then by subdomain, then fallback to first host
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
    await delay(100);
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
    await delay(200);
    if (!updatedList || updatedList.length === 0) return sessionHosts;
    sessionHosts = updatedList.map(updatedHost => {
      const existingHost = sessionHosts.find(h => h.id === updatedHost.id);
      return { ...existingHost, ...updatedHost }; // Merge existing with updates
    });
    commitToDisk();
    return sessionHosts;
  },

  async updateApartments(updatedList: Apartment[]): Promise<Apartment[]> {
    await delay(200);
    if (!updatedList || updatedList.length === 0) return sessionApartments;
    const updatedIds = new Set(updatedList.map(u => u.id));
    sessionApartments = [
      ...sessionApartments.filter(sa => !updatedIds.has(sa.id)),
      ...updatedList
    ];
    commitToDisk();
    return sessionApartments;
  },

  async updateBookings(updatedList: Booking[]): Promise<Booking[]> {
    await delay(200);
    if (!updatedList || updatedList.length === 0) return sessionBookings;
    const updatedIds = new Set(updatedList.map(u => u.id));
    sessionBookings = [
      ...sessionBookings.filter(sb => !updatedIds.has(sb.id)),
      ...updatedList
    ];
    commitToDisk();
    return sessionBookings;
  },

  async updateBlockedDates(updatedList: BlockedDate[]): Promise<BlockedDate[]> {
    await delay(100);
    sessionBlockedDates = updatedList;
    commitToDisk();
    return sessionBlockedDates;
  }
};