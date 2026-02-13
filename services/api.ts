
import { Apartment, Booking, Host, BlockedDate, keysToCamel } from '../types.js';
import { createClient } from '@supabase/supabase-js';
import { MOCK_HOSTS, MOCK_APARTMENTS, MOCK_BOOKINGS } from '../mockData.js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchAndParseIcal = async (icalUrl: string): Promise<string[]> => {
  await delay(800);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const dummyBlockedDates: string[] = [];
  for (let i = 0; i < 3; i++) {
    const day = Math.floor(Math.random() * 20) + 1;
    dummyBlockedDates.push(new Date(year, month, day).toISOString().split('T')[0]);
  }
  return Array.from(new Set(dummyBlockedDates));
};

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }

  return response.json() as T;
}

export const sanctumApi = {
  async getLandingData(identifier?: { slug?: string; email?: string }, isGuest: boolean = false) {
    const params = new URLSearchParams();
    if (identifier?.slug) params.append('slug', identifier.slug);
    if (identifier?.email) params.append('email', identifier.email);
    if (isGuest) params.append('isGuest', String(isGuest));
    const data = await fetchApi(`/api/v1/landing-data?${params.toString()}`);
    return keysToCamel(data);
  },

  getHostDashboardData() {
    return fetchApi('/api/v1/host-dashboard');
  },

  getAllHosts: () => fetchApi<Host[]>('/api/v1/hosts'),

  getAllApartments: () => fetchApi<Apartment[]>('/api/v1/apartments'),

  getAllBookings: () => fetchApi<Booking[]>('/api/v1/bookings'),

  getAllBlockedDates: () => fetchApi<BlockedDate[]>('/api/v1/blocked-dates'),

  getApartmentAvailability: (apartmentId: string) => fetchApi<{ bookings: Booking[], blockedDates: BlockedDate[] }>(`/api/v1/availability?apartmentId=${apartmentId}`),

  getPublicHosts: () => fetchApi<Pick<Host, 'slug' | 'name'>[]>('/api/v1/public-hosts'),

  createBooking: (data: Partial<Booking>) => fetchApi<Booking>('/api/v1/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateHosts: (data: Host[]) => fetchApi<Host[]>('/api/v1/hosts', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  updateApartments: (data: Apartment[]) => fetchApi<Apartment[]>('/api/v1/apartments', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  updateBookings: (data: Booking[]) => fetchApi<Booking[]>('/api/v1/bookings', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  sendEmail: (toEmail: string, subject: string, templateName: string, booking: Booking, apartment: Apartment, host: Host) => {
      return fetchApi('/api/v1/send-email', {
          method: 'POST',
          body: JSON.stringify({ toEmail, subject, templateName, booking, apartment, host }),
      }).catch(error => {
        console.warn('Email dispatch failed, falling back to console simulation.');
        sanctumApi.simulateEmail(toEmail, subject, templateName, booking);
      });
  },

  sendMessage: (booking: Booking, message: string) => {
    return sanctumApi.post('/api/v1/send-message', { booking, message });
  },
  
  simulateEmail(to: string, subject: string, template: string, booking: any) {
    console.group('%c [MOCK EMAIL DISPATCHED] ', 'background: #e97c62; color: #fff; font-weight: bold;');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Template:', template);
    console.log('Booking Info:', booking);
    console.groupEnd();
  },

  async createBlockedDate(blockedDate: BlockedDate): Promise<BlockedDate> {
    const { data, error } = await supabase.from('blocked_dates').insert({ 
      id: blockedDate.id, 
      apartment_id: blockedDate.apartmentId, 
      date: blockedDate.date 
    }).select().single();
    if (error) throw error;
    return keysToCamel<BlockedDate>(data);
  },

  async deleteBlockedDate(id: string): Promise<void> {
    const { error } = await supabase.from('blocked_dates').delete().eq('id', id);
    if (error) throw error;
  },

  async seedDatabase(): Promise<void> {
    console.log("Seeding database with mock data...");
    await supabase.from('hosts').upsert(MOCK_HOSTS);
    await supabase.from('apartments').upsert(MOCK_APARTMENTS);
    await supabase.from('bookings').upsert(MOCK_BOOKINGS);
    console.log("Database seeding complete.");
  },

  // Generic methods for API calls
  post: (endpoint: string, body: any) => fetchApi(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  }),

  put: (endpoint: string, body: any) => fetchApi(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),

  delete: (endpoint: string, body: any) => fetchApi(endpoint, {
    method: 'DELETE',
    body: JSON.stringify(body),
  }),
};
