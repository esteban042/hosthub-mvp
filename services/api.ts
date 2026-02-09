import { Apartment, Booking, BookingStatus, Host, BlockedDate } from '../types.js';
import { createClient } from '@supabase/supabase-js';
import { MOCK_HOSTS, MOCK_APARTMENTS, MOCK_BOOKINGS } from '../mockData.js';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = 'https://dmldmpdflblwwoppbvkv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lYCWq0C3KkMvjnGYjL-VJg_WewYCS_q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to map DB snake_case to Frontend camelCase
const mapHost = (h: any): Host => ({
  id: h.id,
  slug: h.slug,
  name: h.name,
  bio: h.bio,
  avatar: h.avatar,
  subscriptionType: h.subscription_type,
  commissionRate: h.commission_rate,
  businessName: h.business_name,
  contactEmail: h.contact_email,
  physicalAddress: h.physical_address,
  country: h.country,
  phoneNumber: h.phone_number,
  landingPagePicture: h.landing_page_picture,
  notes: h.notes,
  airbnbCalendarLink: h.airbnb_calendar_link,
  premiumConfig: h.premium_config,
  paymentInstructions: h.payment_instructions
});

const mapApartment = (a: any): Apartment => ({
  id: a.id,
  hostId: a.host_id,
  title: a.title,
  description: a.description,
  city: a.city,
  address: a.address,
  capacity: a.capacity,
  bedrooms: a.bedrooms,
  bathrooms: a.bathrooms,
  pricePerNight: a.price_per_night,
  priceOverrides: a.price_overrides,
  amenities: a.amenities || [],
  photos: a.photos || [],
  isActive: a.is_active,
  mapEmbedUrl: a.map_embed_url
});

const mapBooking = (b: any): Booking => ({
  id: b.id,
  customBookingId: b.custom_booking_id,
  apartmentId: b.apartment_id,
  guestName: b.guest_name,
  guestEmail: b.guest_email,
  guestPhone: b.guest_phone,
  guestCountry: b.guest_country,
  numGuests: b.num_guests,
  startDate: b.start_date,
  endDate: b.end_date,
  status: b.status as BookingStatus,
  totalPrice: b.total_price,
  isDepositPaid: b.is_deposit_paid,
  guestMessage: b.guest_message,
  depositAmount: b.deposit_amount
});

const mapBlockedDate = (d: any): BlockedDate => ({
  id: d.id,
  apartmentId: d.apartment_id,
  date: d.date,
  reason: d.reason
});

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
  async getLandingData(slug?: string): Promise<{ host: Host; apartments: Apartment[]; bookings: Booking[]; blockedDates: BlockedDate[] }> {
    let hostQuery = supabase.from('hosts').select('*');
    if (slug) {
      hostQuery = hostQuery.eq('slug', slug);
    } else {
      hostQuery = hostQuery.limit(1);
    }

    const { data: hostData, error: hostError } = await hostQuery.maybeSingle();
    const finalHostData = hostData || (await supabase.from('hosts').select('*').limit(1).maybeSingle()).data;

    if (!finalHostData) throw new Error("Database is empty or connection failed.");

    const host = mapHost(finalHostData);
    const { data: aptsData } = await supabase.from('apartments').select('*').eq('host_id', host.id);
    const apartments = (aptsData || []).map(mapApartment);
    const apartmentIds = apartments.map(a => a.id);

    const { data: bookingsData } = await supabase.from('bookings').select('*').in('apartment_id', apartmentIds.length > 0 ? apartmentIds : ['none']);
    const bookings = (bookingsData || []).map(mapBooking);

    const { data: blockedData } = await supabase.from('blocked_dates')
      .select('*')
      .or(apartmentIds.length > 0 ? `apartment_id.eq.all,apartment_id.in.(${apartmentIds.join(',')})` : `apartment_id.eq.all`);
    const blockedDates = (blockedData || []).map(mapBlockedDate);

    return { host, apartments, bookings, blockedDates };
  },

  async getAllHosts(): Promise<Host[]> {
    const { data } = await supabase.from('hosts').select('*');
    return (data || []).map(mapHost);
  },
  
  async getAllApartments(): Promise<Apartment[]> {
    const { data } = await supabase.from('apartments').select('*');
    return (data || []).map(mapApartment);
  },

  async getAllBookings(): Promise<Booking[]> {
    const { data } = await supabase.from('bookings').select('*');
    return (data || []).map(mapBooking);
  },

  async createBooking(data: Partial<Booking>): Promise<Booking> {
    if (!data.apartmentId) throw new Error('Apartment ID is required to create a booking.');

    // 1. Get the apartment and its host
    const { data: aptData, error: aptError } = await supabase
      .from('apartments')
      .select(`
        host_id,
        hosts (*)
      `)
      .eq('id', data.apartmentId)
      .single();

    if (aptError || !aptData || !aptData.hosts) {
      console.error('Error fetching apartment or host:', aptError);
      throw new Error('Failed to find apartment or host for this booking.');
    }
    const host = mapHost(aptData.hosts);

    // 2. Get all apartments for this host to count their bookings
    const { data: hostApts, error: hostAptsError } = await supabase
      .from('apartments')
      .select('id')
      .eq('host_id', host.id);

    if (hostAptsError) throw hostAptsError;
    const hostAptIds = hostApts.map(a => a.id);

    // 3. Count existing bookings for this host
    let bookingCount = 0;
    if (hostAptIds.length > 0) {
      const { count, error: countError } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .in('apartment_id', hostAptIds);
      if (countError) throw countError;
      bookingCount = count || 0;
    }
    const newBookingNumber = bookingCount + 1;

    // 4. Generate the custom ID
    const hostInitials = (host.name.match(/\b(\w)/g) || ['H', 'H']).join('').toUpperCase();
    const paddedCount = String(newBookingNumber).padStart(7, '0');
    const customBookingId = `${hostInitials}${paddedCount}`;

    const payload = {
      id: data.id || uuidv4(),
      custom_booking_id: customBookingId,
      apartment_id: data.apartmentId,
      guest_name: data.guestName,
      guest_email: data.guestEmail,
      guest_country: data.guestCountry,
      guest_phone: data.guestPhone,
      num_guests: data.numGuests,
      start_date: data.startDate,
      end_date: data.endDate,
      status: data.status || BookingStatus.CONFIRMED,
      total_price: data.totalPrice,
      is_deposit_paid: data.isDepositPaid || false,
      guest_message: data.guestMessage,
      deposit_amount: data.depositAmount
    };

    const { data: result, error } = await supabase.from('bookings').insert(payload).select().single();
    if (error) throw error;
    return mapBooking(result);
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
        notes: h.notes,
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
        city: a.city,
        address: a.address,
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
      return supabase.from('apartments').upsert({ id: a.id, ...payload });
    });

    await Promise.all(promises);
    return updatedList;
  },

  async updateBookings(updatedList: Booking[]): Promise<Booking[]> {
    const promises = updatedList.map((b: Booking) => {
      const payload: { [key: string]: any } = {
        guest_name: b.guestName,
        status: b.status,
        is_deposit_paid: b.isDepositPaid,
        total_price: b.totalPrice,
      };
      if (b.guestCountry) {
        payload.guest_country = b.guestCountry;
      }
      return supabase.from('bookings').update(payload).eq('id', b.id);
    });

    await Promise.all(promises);
    return updatedList;
  },

  async updateBlockedDates(updatedList: BlockedDate[]): Promise<BlockedDate[]> {
    const promises = updatedList.map(d => {
      return supabase.from('blocked_dates').upsert({
        id: d.id,
        apartment_id: d.apartmentId,
        date: d.date,
        reason: d.reason
      });
    });
    await Promise.all(promises);
    return updatedList;
  },

  async seedDatabase(): Promise<void> {
    const hostPayloads = MOCK_HOSTS.map((h: any) => ({
      id: h.id,
      slug: h.slug,
      name: h.name,
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
      notes: h.notes,
      airbnb_calendar_link: h.airbnbCalendarLink,
      premium_config: h.premiumConfig,
      payment_instructions: h.paymentInstructions
    }));
    await supabase.from('hosts').upsert(hostPayloads);

    const aptPayloads = MOCK_APARTMENTS.map((a: any) => ({
      id: a.id,
      host_id: a.hostId,
      title: a.title,
      description: a.description,
      city: a.city,
      address: a.address,
      capacity: a.capacity,
      bedrooms: a.bedrooms,
      bathrooms: a.bathrooms,
      price_per_night: a.pricePerNight,
      price_overrides: a.priceOverrides,
      amenities: a.amenities,
      photos: a.photos,
      is_active: a.isActive,
      map_embed_url: a.mapEmbedUrl
    }));
    await supabase.from('apartments').upsert(aptPayloads);

    const bookingPayloads = MOCK_BOOKINGS.map((b: any) => ({
      id: b.id,
      custom_booking_id: b.customBookingId,
      apartment_id: b.apartmentId,
      guest_name: b.guestName,
      guest_email: b.guestEmail,
      guest_phone: b.guestPhone,
      guest_country: b.guestCountry,
      num_guests: b.numGuests || 1,
      start_date: b.startDate,
      end_date: b.endDate,
      status: b.status,
      total_price: b.totalPrice,
      is_deposit_paid: b.isDepositPaid,
      guest_message: b.guestMessage,
      deposit_amount: b.depositAmount || 0
    }));
    await supabase.from('bookings').upsert(bookingPayloads);
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
