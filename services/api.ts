import { Apartment, Booking, Host, BlockedDate, keysToCamel, BookingStatus, SubscriptionType } from '../types.js';
import { createClient } from '@supabase/supabase-js';
import { MOCK_HOSTS, MOCK_APARTMENTS, MOCK_BOOKINGS } from '../mockData.js';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    headers: {
      'Cache-Control': 'no-cache',
    },
  },
});

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

export const hostHubApi = {

    async getLandingData(
    identifier?: { slug?: string; email?: string },
    isGuest: boolean = false
  ): Promise<{ host: Host; apartments: Apartment[]; bookings: Booking[]; blockedDates: BlockedDate[] }> {
    const hostSelect = isGuest
      ? 'id, slug, name, bio, avatar, business_name, landing_page_picture, premium_config, country, payment_instructions'
      : '*';

    let hostQuery = supabase.from('hosts').select(hostSelect);
    if (identifier?.slug) {
      hostQuery = hostQuery.eq('slug', identifier.slug);
    } else if (identifier?.email) {
      hostQuery = hostQuery.eq('contact_email', identifier.email);
    } else {
      hostQuery = hostQuery.limit(1);
    }

    const { data: hostData, error: hostError } = await hostQuery.maybeSingle();
    if (hostError) {
      console.error("Error fetching host:", hostError);
      throw new Error("Database query for host failed.");
    }
    if (!hostData) {
        throw new Error(identifier?.slug || identifier?.email ? `Host not found.` : "No hosts found in the database.");
    }

    let host = keysToCamel<Host>(hostData);
    if (isGuest) {
        host = { ...host, commissionRate: 0, subscriptionType: SubscriptionType.BASIC, contactEmail: '', physicalAddress: '', phoneNumber: '', notes: null, airbnbCalendarLink: null };
    }

    const { data: aptsData, error: aptsError } = await supabase.from('apartments').select('*').eq('host_id', host.id);
    if (aptsError) throw aptsError;
    const apartments = keysToCamel<Apartment[]>(aptsData || []);
    const apartmentIds = apartments.map(a => a.id);

    const bookingSelect = isGuest ? 'apartment_id, start_date, end_date' : '*';
    const { data: bookingsData, error: bookingsError } = await supabase.from('bookings').select(bookingSelect).in('apartment_id', apartmentIds.length > 0 ? apartmentIds : ['none']);
    if (bookingsError) throw bookingsError;
    let bookings = keysToCamel<Booking[]>(bookingsData || []);

    if (isGuest) {
      bookings = bookings.map(b => ({
        ...b,
        id: uuidv4(),
        customBookingId: '',
        guestName: '',
        guestEmail: '',
        guestCountry: '',
        guestPhone: null,
        numGuests: 0,
        status: BookingStatus.CONFIRMED,
        totalPrice: 0,
        notes: null,
      }));
    }

    const { data: blockedData, error: blockedError } = await supabase.from('blocked_dates').select('*').in('apartment_id', apartmentIds.length > 0 ? apartmentIds : ['none']);
    if (blockedError) throw blockedError;
    const blockedDates = keysToCamel<BlockedDate[]>(blockedData || []);

    return { host, apartments, bookings, blockedDates };
  },

  async getHostDashboardData(): Promise<{ host: Host; apartments: Apartment[]; bookings: Booking[]; blockedDates: BlockedDate[] }> {
    const response = await fetch('/api/v1/host-dashboard');
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch host dashboard data.' }));
        throw new Error(errorData.error || 'Failed to fetch host dashboard data.');
    }
    const hostData = await response.json();

    if (hostData && hostData.apartments) {
        const apartmentIds = hostData.apartments.map((a: Apartment) => a.id);
        const { data: blockedData, error: blockedError } = await supabase
            .from('blocked_dates')
            .select('*')
            .in('apartment_id', apartmentIds.length > 0 ? apartmentIds : ['none']);

        if (blockedError) {
            console.error("Manual fetch of blocked dates failed:", blockedError);
            hostData.blockedDates = [];
        } else {
            hostData.blockedDates = keysToCamel<BlockedDate[]>(blockedData || []);
        }
    } else {
        hostData.blockedDates = [];
    }

    return hostData;
  },

  async getAllHosts(): Promise<Host[]> {
    const { data, error } = await supabase.from('hosts').select('*');
    if (error) throw error;
    return keysToCamel<Host[]>(data || []);
  },
  
  async getPublicHosts(): Promise<Pick<Host, 'slug' | 'name'>[]> {
    const { data, error } = await supabase.from('hosts').select('slug, name');
    if (error) throw error;
    return keysToCamel<Pick<Host, 'slug' | 'name'>[]>(data || []);
  },

  async getAllApartments(): Promise<Apartment[]> {
    const { data, error } = await supabase.from('apartments').select('*');
    if (error) throw error;
    return keysToCamel<Apartment[]>(data || []);
  },

  async getAllBookings(): Promise<Booking[]> {
    const { data, error } = await supabase.from('bookings').select('*');
    if (error) throw error;
    return keysToCamel<Booking[]>(data || []);
  },

  async createBooking(data: Partial<Booking>): Promise<Booking> {
    const response = await fetch('/api/v1/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create booking.' }));
      throw new Error(errorData.error || 'Failed to create booking.');
    }
    
    return await response.json();
  },

  async updateHosts(updatedList: Host[]): Promise<Host[]> {
    const promises = updatedList.map((h: Host) => {
      const payload = {
        name: h.name,
        slug: h.slug,
        bio: h.bio,
        avatar: h.avatar,
        subscription_type: h.subscriptionType,
        commission_rate: h.commissionRate,
        business_name: h.businessName,
        contact_email: h.contactEmail,
        physical_address: h.physicalAddress,
        country: h.country,
        phone_number: h.phoneNumber,
        landing_page_picture: h.landingPagePicture,
        airbnb_calendar_link: h.airbnbCalendarLink,
        premium_config: h.premiumConfig,
        payment_instructions: h.paymentInstructions
      };
      return supabase.from('hosts').update(payload).eq('id', h.id);
    });

    await Promise.all(promises);
    return this.getAllHosts();
  },

  async updateApartments(updatedList: Apartment[]): Promise<Apartment[]> {
    const promises = updatedList.map((a: Apartment) => {
        const payload = {
            host_id: a.hostId,
            title: a.title,
            description: a.description,
            address: a.address,
            city: a.city,
            capacity: a.capacity,
            bedrooms: a.bedrooms,
            bathrooms: a.bathrooms,
            price_per_night: a.pricePerNight,
            price_overrides: a.priceOverrides,
            amenities: a.amenities,
            photos: a.photos,
            is_active: a.isActive,
            map_embed_url: a.mapEmbedUrl
        };
        return supabase.from('apartments').update(payload).eq('id', a.id);
    });

    await Promise.all(promises);
    return updatedList;
  },
  

  async updateBookings(updatedList: Booking[]): Promise<Booking[]> {
    const promises = updatedList.map((b: Booking) => {
        const payload = {
            guest_name: b.guestName,
            guest_email: b.guestEmail,
            guest_country: b.guestCountry,
            num_guests: b.numGuests,
            start_date: b.startDate,
            end_date: b.endDate,
            total_price: b.totalPrice,
            status: b.status,
        };
        return supabase.from('bookings').update(payload).eq('id', b.id).select();
    });

    const results = await Promise.all(promises);

    const successfullyUpdatedBookings: Booking[] = [];
    for (const result of results) {
        if (result.error || !result.data || result.data.length === 0) {
            console.error("Supabase update error or no rows updated:", result.error);
            throw new Error('Database update failed. A security policy may have prevented the change.');
        }
        successfullyUpdatedBookings.push(...keysToCamel<Booking[]>(result.data));
    }

    return successfullyUpdatedBookings;
  },

  async createBlockedDate(blockedDate: BlockedDate): Promise<BlockedDate> {
    const { data, error } = await supabase
        .from('blocked_dates')
        .insert({
            id: blockedDate.id,
            apartment_id: blockedDate.apartmentId,
            date: blockedDate.date,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating blocked date:", error);
        throw error;
    }
    return keysToCamel<BlockedDate>(data);
  },

  async deleteBlockedDate(id: string): Promise<void> {
      const { error } = await supabase
          .from('blocked_dates')
          .delete()
          .eq('id', id);

      if (error) {
          console.error("Error deleting blocked date:", error);
          throw error;
      }
  },

  async seedDatabase(): Promise<void> {
    console.log("Seeding database with mock data...");
    await supabase.from('hosts').upsert(MOCK_HOSTS);
    await supabase.from('apartments').upsert(MOCK_APARTMENTS);
    await supabase.from('bookings').upsert(MOCK_BOOKINGS);
    console.log("Database seeding complete.");
  },

  async sendEmail(
    toEmail: string,
    subject: string,
    templateName: string,
    booking: Booking,
    apartment: Apartment,
    host: Host
  ): Promise<void> {
    const endpoint = `/api/v1/send-email`;
    console.log(`[HostHub Client] Triggering email dispatch via endpoint: ${endpoint}`);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail, subject, templateName, booking, apartment, host }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('[HostHub Client] API route not found on this server. Ensure server.ts is the main process.');
          this.simulateEmail(toEmail, subject, templateName, booking);
          return;
        }
        throw new Error(`Cloud Run API error: ${response.status}`);
      }
      console.log('[HostHub Client] Email task accepted by backend.');
    } catch (error) {
      console.warn('[HostHub Client] Network error or 404. Falling back to console simulation.');
      this.simulateEmail(toEmail, subject, templateName, booking);
    }
  },

  simulateEmail(to: string, subject: string, template: string, booking: any) {
    console.group('%c [MOCK EMAIL DISPATCHED] ', 'background: #e97c62; color: #fff; font-weight: bold;');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Template:', template);
    console.log('Booking Info:', booking);
    console.log('Reason: Backend route unreachable (Using Frontend-Only fallback)');
    console.groupEnd();
  }
};
