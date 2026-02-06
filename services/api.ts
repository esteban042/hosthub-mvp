import { Apartment, Booking, BookingStatus, Host, BlockedDate } from '../types';
import { createClient } from '@supabase/supabase-js';
import { MOCK_HOSTS, MOCK_APARTMENTS, MOCK_BOOKINGS } from '../mockData';

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
  contactEmail: h.contact_email,
  physicalAddress: h.physical_address,
  country: h.country,
  phoneNumber: h.phone_number,
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
  apartmentId: b.apartment_id,
  guestEmail: b.guest_email,
  guestPhone: b.guest_phone,
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
  console.log(`Simulating fetching and parsing iCal from: ${icalUrl}`);
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
    if (hostError) console.error("Host Fetch Error:", hostError);

    const finalHostData = hostData || (await supabase.from('hosts').select('*').limit(1).maybeSingle()).data;
    
    if (!finalHostData) throw new Error("Database is empty or connection failed. Please run the SQL initialization in Supabase and then use the 'Seed System' button in the Admin Dashboard.");
    
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

  async createBooking(data: Partial<Booking>): Promise<Booking> {
    const payload = {
      id: data.id || `book-${Date.now()}`,
      apartment_id: data.apartmentId,
      guest_email: data.guestEmail,
      guest_phone: data.guestPhone,
      num_guests: data.numGuests,
      start_date: data.startDate,
      end_date: data.endDate,
      status: data.status || BookingStatus.REQUESTED,
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
    const promises = updatedList.map(h => {
      const payload = {
        name: h.name,
        slug: h.slug,
        bio: h.bio,
        avatar: h.avatar,
        subscription_type: h.subscriptionType,
        commission_rate: h.commissionRate,
        contact_email: h.contactEmail,
        physical_address: h.physicalAddress,
        country: h.country,
        phone_number: h.phoneNumber,
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
    const promises = updatedList.map(a => {
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
    const promises = updatedList.map(b => {
      const payload = {
        status: b.status,
        is_deposit_paid: b.isDepositPaid,
        total_price: b.totalPrice
      };
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
    console.log("Seeding Supabase Database...");
    
    // 1. Seed Hosts
    const hostPayloads = MOCK_HOSTS.map(h => ({
      id: h.id,
      slug: h.slug,
      name: h.name,
      bio: h.bio,
      avatar: h.avatar,
      subscription_type: h.subscriptionType,
      commission_rate: h.commissionRate,
      contact_email: h.contactEmail,
      physical_address: h.physicalAddress,
      country: h.country,
      phone_number: h.phoneNumber,
      notes: h.notes,
      airbnb_calendar_link: h.airbnbCalendarLink,
      premium_config: h.premiumConfig,
      payment_instructions: h.paymentInstructions
    }));
    
    const { error: hostErr } = await supabase.from('hosts').upsert(hostPayloads);
    if (hostErr) throw new Error(`Host Seeding Failed: ${hostErr.message}. Ensure the 'hosts' table exists and RLS is disabled or allows inserts.`);

    // 2. Seed Apartments
    const aptPayloads = MOCK_APARTMENTS.map(a => ({
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
    const { error: aptErr } = await supabase.from('apartments').upsert(aptPayloads);
    if (aptErr) throw new Error(`Apartment Seeding Failed: ${aptErr.message}`);

    // 3. Seed Bookings
    const bookingPayloads = MOCK_BOOKINGS.map(b => ({
      id: b.id,
      apartment_id: b.apartmentId,
      guest_email: b.guestEmail,
      guest_phone: b.guestPhone,
      num_guests: b.numGuests || 1,
      start_date: b.startDate,
      end_date: b.endDate,
      status: b.status,
      total_price: b.totalPrice,
      is_deposit_paid: b.isDepositPaid,
      guest_message: b.guestMessage,
      deposit_amount: b.depositAmount || 0
    }));
    const { error: bookErr } = await supabase.from('bookings').upsert(bookingPayloads);
    if (bookErr) throw new Error(`Booking Seeding Failed: ${bookErr.message}`);

    console.log("Seeding Complete!");
  }
};