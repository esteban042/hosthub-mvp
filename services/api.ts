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
    // Step 1: Securely select host data. Only public fields for guests.
    const hostSelect = isGuest
      ? 'id, slug, name, bio, avatar, business_name, landing_page_picture, premium_config, country, payment_instructions' // Public fields
      : '*'; // All fields for authenticated users

    let hostQuery = supabase.from('hosts').select(hostSelect);
    if (identifier?.slug) {
      hostQuery = hostQuery.eq('slug', identifier.slug);
    } else if (identifier?.email) {
      hostQuery = hostQuery.eq('contact_email', identifier.email);
    } else {
      // Fallback for when no identifier is provided.
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
    // Blank out sensitive fields for guests as an extra layer of security.
    if (isGuest) {
        host = { ...host, commissionRate: 0, subscriptionType: SubscriptionType.BASIC, contactEmail: '', physicalAddress: '', phoneNumber: '', notes: null, airbnbCalendarLink: null };
    }

    // Step 2: Get apartments for the identified host.
    const { data: aptsData, error: aptsError } = await supabase.from('apartments').select('*').eq('host_id', host.id);
    if (aptsError) throw aptsError;
    const apartments = keysToCamel<Apartment[]>(aptsData || []);
    const apartmentIds = apartments.map(a => a.id);

    // Step 3: Securely select booking data. ONLY non-sensitive fields for guests.
    const bookingSelect = isGuest ? 'apartment_id, start_date, end_date' : '*';
    const { data: bookingsData, error: bookingsError } = await supabase.from('bookings').select(bookingSelect).in('apartment_id', apartmentIds.length > 0 ? apartmentIds : ['none']);
    if (bookingsError) throw bookingsError;
    let bookings = keysToCamel<Booking[]>(bookingsData || []);

    // Step 4: For guests, replace all sensitive booking info with empty placeholders.
    if (isGuest) {
      bookings = bookings.map(b => ({
        ...b,
        id: uuidv4(), // Generate a fake ID to prevent any real ID leakage
        customBookingId: '',
        guestName: '',
        guestEmail: '',
        guestCountry: '',
        guestPhone: null,
        numGuests: 0,
        status: BookingStatus.CONFIRMED, // Needed for calendar availability display
        totalPrice: 0,
        notes: null,
      }));
    }

    // Step 5: Get manually blocked dates (non-sensitive).
    const { data: blockedData, error: blockedError } = await supabase.from('blocked_dates').select('*').in('apartment_id', apartmentIds.length > 0 ? apartmentIds : ['none']);
    if (blockedError) throw blockedError;
    const blockedDates = keysToCamel<BlockedDate[]>(blockedData || []);

    return { host, apartments, bookings, blockedDates };
  },

  async getHostDataByUserId(userId: string): Promise<{ host: Host; apartments: Apartment[]; bookings: Booking[]; blockedDates: BlockedDate[] } | null> {
    const { data: hostData, error: hostError } = await supabase.from('hosts').select('*').eq('user_id', userId).single();

    if (hostError) {
        console.error("Error fetching host by user ID:", hostError);
        if (hostError.code === 'PGRST116') { // PostgREST error for "exact one row not found"
            throw new Error('Host profile not found for the logged-in user.');
        }
        throw new Error("Database query for host failed.");
    }
    if (!hostData) return null;

    const host = keysToCamel<Host>(hostData);

    const { data: aptsData, error: aptsError } = await supabase.from('apartments').select('*').eq('host_id', host.id);
    if (aptsError) throw aptsError;
    const apartments = keysToCamel<Apartment[]>(aptsData || []);
    const apartmentIds = apartments.map(a => a.id);

    const { data: bookingsData, error: bookingsError } = await supabase.from('bookings').select('*').in('apartment_id', apartmentIds.length > 0 ? apartmentIds : ['none']);
    if (bookingsError) throw bookingsError;
    const bookings = keysToCamel<Booking[]>(bookingsData || []);

    const { data: blockedData, error: blockedError } = await supabase.from('blocked_dates').select('*').in('apartment_id', apartmentIds.length > 0 ? apartmentIds : ['none']);
    if (blockedError) throw blockedError;
    const blockedDates = keysToCamel<BlockedDate[]>(blockedData || []);

    return { host, apartments, bookings, blockedDates };
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
    if (!data.apartmentId) throw new Error('Apartment ID is required to create a booking.');

    const { data: aptData, error: aptError } = await supabase
      .from('apartments')
      .select(`hosts (*)`).eq('id', data.apartmentId)
      .single();

    if (aptError || !aptData || !aptData.hosts) {
      throw new Error('Failed to find apartment or host for this booking.');
    }
    const host = keysToCamel<Host>(aptData.hosts);

    const { count, error: countError } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .in('apartment_id', (await supabase.from('apartments').select('id').eq('host_id', host.id)).data?.map(a => a.id) || []);
    if (countError) throw countError;

    const hostInitials = (host.name.match(/\b(\w)/g) || ['H', 'H']).join('').toUpperCase();
    const customBookingId = `${hostInitials}${String((count || 0) + 1).padStart(7, '0')}`;

    const payload = {
      id: data.id || uuidv4(),
      custom_booking_id: customBookingId,
      apartment_id: data.apartmentId,
      guest_name: data.guestName,
      guest_email: data.guestEmail,
      guest_country: data.guestCountry,
      num_guests: data.numGuests,
      start_date: data.startDate,
      end_date: data.endDate,
      status: data.status,
      total_price: data.totalPrice
    };

    const { data: result, error } = await supabase.from('bookings').insert(payload).select().single();
    if (error) throw error;
    return keysToCamel<Booking>(result);
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
        // Use .select() to get the updated row back. This is crucial.
        return supabase.from('bookings').update(payload).eq('id', b.id).select();
    });

    const results = await Promise.all(promises);

    const successfullyUpdatedBookings: Booking[] = [];
    for (const result of results) {
        // A failed update can either have an error or return no data.
        if (result.error || !result.data || result.data.length === 0) {
            console.error("Supabase update error or no rows updated:", result.error);
            // Throw an error that the frontend can catch.
            // This will trigger the `catch` block in `handleUpdateStatus`.
            throw new Error('Database update failed. A security policy may have prevented the change.');
        }
        // If successful, convert the snake_case result from DB to camelCase and add to our list.
        successfullyUpdatedBookings.push(...keysToCamel<Booking[]>(result.data));
    }

    // Return the array of bookings that were confirmed to be updated in the DB.
    return successfullyUpdatedBookings;
  },

  async updateBlockedDates(updatedList: BlockedDate[]): Promise<BlockedDate[]> {
    const promises = updatedList.map(d => {
      return supabase.from('blocked_dates').upsert({
        id: d.id,
        apartment_id: d.apartmentId,
        date: d.date,
      });
    });
    await Promise.all(promises);
    return updatedList;
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
