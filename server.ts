import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { SubscriptionType, Host, Apartment, Booking, BlockedDate } from './types'; // Import types
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Database Configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
app.use(express.static(path.join(__dirname, 'client')));

app.use(cors());
app.use(express.json());

/**
 * Utility functions for converting between snake_case and camelCase
 * for database interaction.
 */
function snakeToCamel<T>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map(v => snakeToCamel(v)) as T;
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/([_][a-z])/ig, ($1) => {
        return $1.toUpperCase().replace('_', '');
      });
      acc[camelKey] = snakeToCamel(obj[key]);
      return acc;
    }, {} as any) as T;
  }
  return obj;
}

function camelToSnake(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => camelToSnake(v));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce<Record<string, any>>((acc, key) => {
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      acc[snakeKey] = camelToSnake(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

/**
 * DATABASE INITIALIZATION
 * Automatically creates tables if they do not exist on startup.
 */
const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS hosts (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE,
        name TEXT,
        bio TEXT,
        avatar TEXT,
        subscription_type TEXT NOT NULL DEFAULT 'basic',
        commission_rate INT NOT NULL DEFAULT 3,
        contact_email TEXT,
        physical_address TEXT,
        country TEXT,
        phone_number TEXT,
        notes TEXT,
        airbnb_calendar_link TEXT
      );
      CREATE TABLE IF NOT EXISTS apartments (
        id TEXT PRIMARY KEY,
        host_id TEXT REFERENCES hosts(id),
        title TEXT,
        description TEXT,
        city TEXT,
        address TEXT,
        capacity INT,
        bedrooms INT,
        bathrooms INT,
        price_per_night INT,
        price_overrides JSONB,
        amenities JSONB,
        photos JSONB,
        is_active BOOLEAN DEFAULT TRUE
      );
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        apartment_id TEXT REFERENCES apartments(id),
        guest_email TEXT,
        guest_phone TEXT,
        num_guests INT,
        start_date DATE,
        end_date DATE,
        status TEXT,
        total_price INT,
        is_deposit_paid BOOLEAN DEFAULT FALSE
      );
      CREATE TABLE IF NOT EXISTS blocked_dates (
        id TEXT PRIMARY KEY,
        apartment_id TEXT,
        date DATE,
        reason TEXT
      );
    `);
    console.log('Database Schema Verified');
  } catch (err) {
    console.error('Database Initialization Error:', err);
  } finally {
    client.release();
  }
};

initDb();

/**
 * Multi-Tenant Middleware - Adjusted for Render
 */
const tenantMiddleware = async (req: any, res: any, next: any) => {
  const hostHeader = req.headers.host || '';
  let subdomain = '';

  // Prioritize slug from query parameter
  if (req.query.slug) {
    subdomain = req.query.slug;
  } else {
    // Attempt to extract subdomain from host header
    const parts = hostHeader.split('.');
    if (parts.length > 2 && !hostHeader.includes('localhost') && !hostHeader.endsWith('.onrender.com')) {
      subdomain = parts[0]; // e.g., 'subdomain.yourdomain.com' -> 'subdomain'
    } else if (hostHeader.endsWith('.onrender.com')) {
      // For Render, if no custom domain, the host might be 'service-name.onrender.com'
      // We'll use the service name as the subdomain for matching
      subdomain = parts[0];
    } else {
      // Default for local development or if no clear subdomain
      subdomain = 'alpine-getaways';
    }
  }

  try {
    let hostResult = await pool.query('SELECT * FROM hosts WHERE slug = $1', [subdomain]);

    if (hostResult.rows.length === 0) {
      // Fallback if specific slug not found, try the first host available
      hostResult = await pool.query('SELECT * FROM hosts LIMIT 1');
    }

    if (hostResult.rows.length === 0) {
      return res.status(404).json({ error: 'No host configuration found. Please seed the database.' });
    }

    req.tenant = snakeToCamel<Host>(hostResult.rows[0]);
    next();
  } catch (error: any) {
    res.status(500).json({ error: 'Tenant lookup failed', details: error.message });
  }
};

// --- API ROUTES ---

// Initial Seeding Route
app.post('/api/v1/seed', async (req, res) => {
  try {
    const hostId1 = 'host-1';
    await pool.query(`
      INSERT INTO hosts (id, slug, name, bio, avatar, subscription_type, commission_rate, contact_email, physical_address, country, phone_number, notes, airbnb_calendar_link) 
      VALUES ($1, 'alpine-getaways', 'Sarah Miller', 'Avid mountain explorer and curator of cozy high-altitude retreats with a focus on local timber and hand-woven textiles.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200', $2, $3, 'sarah.miller@alpine.com', 'Via Cantonale 10, 3818 Grindelwald', 'Switzerland', '+41 79 123 45 67', 'Premium host with strong performance in winter bookings.', 'https://www.airbnb.com/calendar/ical/12345.ics?s=5a0d31b0e3e26f5d6f7b11d3')
      ON CONFLICT (id) DO UPDATE SET 
        slug = EXCLUDED.slug, name = EXCLUDED.name, bio = EXCLUDED.bio, avatar = EXCLUDED.avatar, 
        subscription_type = EXCLUDED.subscription_type, commission_rate = EXCLUDED.commission_rate,
        contact_email = EXCLUDED.contact_email, physical_address = EXCLUDED.physical_address,
        country = EXCLUDED.country, phone_number = EXCLUDED.phone_number, notes = EXCLUDED.notes,
        airbnb_calendar_link = EXCLUDED.airbnb_calendar_link
    `, [hostId1, SubscriptionType.PRO, 4]);

    const hostId2 = 'host-2';
    await pool.query(`
      INSERT INTO hosts (id, slug, name, bio, avatar, subscription_type, commission_rate, contact_email, physical_address, country, phone_number, notes, airbnb_calendar_link) 
      VALUES ($1, 'urban-retreats', 'James Chen', 'Architect focusing on minimalist urban living. Creating sanctuaries of silence and light in the heart of bustling cities.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200', $2, $3, 'james.chen@urban.com', 'Shibuya 1-1, Tokyo', 'Japan', '+81 90 9876 5432', 'Focus on high-tech amenities and modern design. Exploring expansion to Osaka.', 'https://www.airbnb.com/calendar/ical/67890.ics?s=c8f2a1e7d9b4c0a5f1e6b3a2')
      ON CONFLICT (id) DO UPDATE SET 
        slug = EXCLUDED.slug, name = EXCLUDED.name, bio = EXCLUDED.bio, avatar = EXCLUDED.avatar, 
        subscription_type = EXCLUDED.subscription_type, commission_rate = EXCLUDED.commission_rate,
        contact_email = EXCLUDED.contact_email, physical_address = EXCLUDED.physical_address,
        country = EXCLUDED.country, phone_number = EXCLUDED.phone_number, notes = EXCLUDED.notes,
        airbnb_calendar_link = EXCLUDED.airbnb_calendar_link
    `, [hostId2, SubscriptionType.BASIC, 3]);

    const hostId3 = 'host-3';
    await pool.query(`
      INSERT INTO hosts (id, slug, name, bio, avatar, subscription_type, commission_rate, contact_email, physical_address, country, phone_number, notes, airbnb_calendar_link) 
      VALUES ($1, 'tuscan-sun', 'Elena Rossi', 'Third-generation villa manager dedicated to preserving the rustic elegance of the Italian countryside.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200', $2, $3, 'elena.rossi@tuscan.it', 'Via Chianti 50, 53100 Siena', 'Italy', '+39 333 1122334', 'Manages several high-end villas. Looking to add more properties in Umbria next year.', 'https://www.airbnb.com/calendar/ical/11223.ics?s=a9b8c7d6e5f4a3b2c1d0e9f8')
      ON CONFLICT (id) DO UPDATE SET 
        slug = EXCLUDED.slug, name = EXCLUDED.name, bio = EXCLUDED.bio, avatar = EXCLUDED.avatar, 
        subscription_type = EXCLUDED.subscription_type, commission_rate = EXCLUDED.commission_rate,
        contact_email = EXCLUDED.contact_email, physical_address = EXCLUDED.physical_address,
        country = EXCLUDED.country, phone_number = EXCLUDED.phone_number, notes = EXCLUDED.notes,
        airbnb_calendar_link = EXCLUDED.airbnb_calendar_link
    `, [hostId3, SubscriptionType.ENTERPRISE, 5]);

    await pool.query(`
      INSERT INTO apartments (id, host_id, title, description, city, capacity, bedrooms, bathrooms, price_per_night, is_active, amenities, photos, price_overrides)
      VALUES 
      ('apt-1', $1, 'Modern Chalet with Valley View', 'A beautiful timber chalet overlooking the Swiss Alps. Features hand-carved furniture, a stone hearth, and panoramic windows that catch the golden hour perfectly.', 'Grindelwald', 4, 2, 2, 250, TRUE, '["Wifi", "Kitchen", "Free Parking", "Fireplace", "Air Conditioning"]', '["https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800&h=600", "https://images.unsplash.com/photo-1449156003053-c3ca32454685?auto=format&fit=crop&q=80&w=800&h=600"]', '[{"id": "pr-1", "startDate": "2025-12-20", "endDate": "2026-01-05", "price": 450, "label": "Holiday Season"}]')
      ON CONFLICT (id) DO UPDATE SET
        host_id = EXCLUDED.host_id, title = EXCLUDED.title, description = EXCLUDED.description, city = EXCLUDED.city,
        capacity = EXCLUDED.capacity, bedrooms = EXCLUDED.bedrooms, bathrooms = EXCLUDED.bathrooms,
        price_per_night = EXCLUDED.price_per_night, is_active = EXCLUDED.is_active,
        amenities = EXCLUDED.amenities, photos = EXCLUDED.photos, price_overrides = EXCLUDED.price_overrides
    `, [hostId1]);
    
    await pool.query(`
      INSERT INTO apartments (id, host_id, title, description, city, capacity, bedrooms, bathrooms, price_per_night, is_active, amenities, photos)
      VALUES 
      ('apt-2', $1, 'The Hikers Lookout', 'A refined studio suite at the base of the Eiger trail. Minimalist design meets rustic warmth with wool blankets and locally sourced cedar walls.', 'Grindelwald', 2, 1, 1, 125, TRUE, '["Wifi", "Coffee Maker", "Fireplace", "Washer"]', '["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800&h=600"]')
      ON CONFLICT (id) DO UPDATE SET
        host_id = EXCLUDED.host_id, title = EXCLUDED.title, description = EXCLUDED.description, city = EXCLUDED.city,
        capacity = EXCLUDED.capacity, bedrooms = EXCLUDED.bedrooms, bathrooms = EXCLUDED.bathrooms,
        price_per_night = EXCLUDED.price_per_night, is_active = EXCLUDED.is_active,
        amenities = EXCLUDED.amenities, photos = EXCLUDED.photos
    `, [hostId1]);

    await pool.query(`
      INSERT INTO apartments (id, host_id, title, description, city, capacity, bedrooms, bathrooms, price_per_night, is_active, amenities, photos, price_overrides)
      VALUES 
      ('apt-3', $1, 'Minimalist Shibuya Loft', 'A sanctuary of light and shadow in Tokyo. Features industrial concrete softened by warm oak floors and curated Japanese art.', 'Tokyo', 2, 1, 1, 210, TRUE, '["Wifi", "Air Conditioning", "Washer", "Kitchen"]', '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800&h=600"]', '[{"id": "pr-2", "startDate": "2025-03-25", "endDate": "2025-04-10", "price": 320, "label": "Cherry Blossom Peak"}]')
      ON CONFLICT (id) DO UPDATE SET
        host_id = EXCLUDED.host_id, title = EXCLUDED.title, description = EXCLUDED.description, city = EXCLUDED.city,
        capacity = EXCLUDED.capacity, bedrooms = EXCLUDED.bedrooms, bathrooms = EXCLUDED.bathrooms,
        price_per_night = EXCLUDED.price_per_night, is_active = EXCLUDED.is_active,
        amenities = EXCLUDED.amenities, photos = EXCLUDED.photos, price_overrides = EXCLUDED.price_overrides
    `, [hostId2]);
    
    await pool.query(`
      INSERT INTO apartments (id, host_id, title, description, city, capacity, bedrooms, bathrooms, price_per_night, is_active, amenities, photos)
      VALUES 
      ('apt-4', $1, 'Olive Grove Villa', 'Experience the soul of Tuscany in this 18th-century stone farmhouse. Surrounded by silver-leafed olive trees and the scent of wild rosemary.', 'Siena', 6, 3, 3, 450, TRUE, '["Kitchen", "Free Parking", "Fireplace", "Washer", "Air Conditioning"]', '["https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&q=80&w=800&h=600"]')
      ON CONFLICT (id) DO UPDATE SET
        host_id = EXCLUDED.host_id, title = EXCLUDED.title, description = EXCLUDED.description, city = EXCLUDED.city,
        capacity = EXCLUDED.capacity, bedrooms = EXCLUDED.bedrooms, bathrooms = EXCLUDED.bathrooms,
        price_per_night = EXCLUDED.price_per_night, is_active = EXCLUDED.is_active,
        amenities = EXCLUDED.amenities, photos = EXCLUDED.photos
    `, [hostId3]);

    const currentYear = new Date().getFullYear();

    await pool.query(`
      INSERT INTO bookings (id, apartment_id, guest_email, guest_phone, num_guests, start_date, end_date, status, total_price, is_deposit_paid)
      VALUES 
      ('book-1', 'apt-1', 'traveler@boutique.com', '+41 79 123 45 67', 2, '${currentYear}-06-10', '${currentYear}-06-15', 'confirmed', 1250, TRUE),
      ('book-2', 'apt-3', 'city.mapper@design.jp', '+81 90 9876 5432', 1, '${currentYear}-07-01', '${currentYear}-07-05', 'requested', 840, FALSE),
      ('book-3', 'apt-4', 'family.rossi@italy.it', '+39 333 1122334', 4, '${currentYear}-08-12', '${currentYear}-08-19', 'confirmed', 3150, TRUE),
      ('book-4', 'apt-1', 'alpine.lover@example.com', '+41 79 123 45 67', 2, '${currentYear}-01-10', '${currentYear}-01-12', 'paid', 500, TRUE)
      ON CONFLICT (id) DO UPDATE SET
        apartment_id = EXCLUDED.apartment_id, guest_email = EXCLUDED.guest_email, guest_phone = EXCLUDED.guest_phone,
        num_guests = EXCLUDED.num_guests, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date,
        status = EXCLUDED.status, total_price = EXCLUDED.total_price, is_deposit_paid = EXCLUDED.is_deposit_paid
    `);

    res.json({ message: 'Seed data successfully applied' });
  } catch (err: any) {
    res.status(500).json({ error: 'Seeding failed', details: err.message });
  }
});

// Get Public Landing Data
app.get('/api/v1/landing', tenantMiddleware, async (req: any, res) => {
  const hostId = req.tenant.id;
  try {
    const apartmentsQuery = await pool.query('SELECT * FROM apartments WHERE host_id = $1', [hostId]);
    const apartments = snakeToCamel<Apartment[]>(apartmentsQuery.rows);
    const apartmentIds = apartments.map(a => a.id);
    
    let bookings: Booking[] = [];
    if (apartmentIds.length > 0) {
      const bookingsQuery = await pool.query('SELECT * FROM bookings WHERE apartment_id = ANY($1)', [apartmentIds]);
      bookings = snakeToCamel<Booking[]>(bookingsQuery.rows);
    }
      
    let blockedDates: BlockedDate[] = [];
    if (apartmentIds.length > 0) {
      const blockedDatesQuery = await pool.query('SELECT * FROM blocked_dates WHERE apartment_id = \'all\' OR apartment_id = ANY($1)', [apartmentIds]);
      blockedDates = snakeToCamel<BlockedDate[]>(blockedDatesQuery.rows);
    } else {
      const blockedDatesQuery = await pool.query('SELECT * FROM blocked_dates WHERE apartment_id = \'all\''); // Still fetch global blocks
      blockedDates = snakeToCamel<BlockedDate[]>(blockedDatesQuery.rows);
    }

    res.json({
      host: req.tenant,
      apartments: apartments,
      bookings: bookings,
      blockedDates: blockedDates
    });
  } catch (err: any) {
    console.error('Failed to fetch landing data:', err);
    res.status(500).json({ error: 'Failed to fetch landing data', details: err.message });
  }
});

// New endpoint to get all hosts (for AdminDashboard)
app.get('/api/v1/hosts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hosts');
    res.json(snakeToCamel<Host[]>(result.rows));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch hosts', details: err.message });
  }
});

// New endpoint to update multiple hosts (for AdminDashboard)
app.put('/api/v1/hosts', async (req, res) => {
  const updatedHosts: Host[] = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const h of updatedHosts) {
      const snakeCaseHost = camelToSnake(h);
      await client.query(`
        UPDATE hosts SET
          slug = $2, name = $3, bio = $4, avatar = $5,
          subscription_type = $6, commission_rate = $7,
          contact_email = $8, physical_address = $9,
          country = $10, phone_number = $11, notes = $12,
          airbnb_calendar_link = $13
        WHERE id = $1
      `, [
        snakeCaseHost.id, snakeCaseHost.slug, snakeCaseHost.name, snakeCaseHost.bio, snakeCaseHost.avatar,
        snakeCaseHost.subscription_type, snakeCaseHost.commission_rate,
        snakeCaseHost.contact_email, snakeCaseHost.physical_address,
        snakeCaseHost.country, snakeCaseHost.phone_number, snakeCaseHost.notes,
        snakeCaseHost.airbnb_calendar_link
      ]);
    }
    await client.query('COMMIT');
    const result = await pool.query('SELECT * FROM hosts'); // Return all hosts
    res.json(snakeToCamel<Host[]>(result.rows));
  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to update hosts', details: err.message });
  } finally {
    client.release();
  }
});

// New endpoint to create a booking
app.post('/api/v1/bookings', async (req, res) => {
  const newBookingData: Booking = req.body;
  const id = newBookingData.id || `book-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const snakeCaseBooking = camelToSnake({ ...newBookingData, id });
  try {
    const result = await pool.query(`
      INSERT INTO bookings (id, apartment_id, guest_email, guest_phone, num_guests, start_date, end_date, status, total_price, is_deposit_paid)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      snakeCaseBooking.id, snakeCaseBooking.apartment_id, snakeCaseBooking.guest_email, snakeCaseBooking.guest_phone,
      snakeCaseBooking.num_guests, snakeCaseBooking.start_date, snakeCaseBooking.end_date, snakeCaseBooking.status,
      snakeCaseBooking.total_price, snakeCaseBooking.is_deposit_paid
    ]);
    res.status(201).json(snakeToCamel<Booking>(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create booking', details: err.message });
  }
});

// New endpoint to update multiple bookings
app.put('/api/v1/bookings', async (req, res) => {
  const updatedBookings: Booking[] = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const b of updatedBookings) {
      const snakeCaseBooking = camelToSnake(b);
      await client.query(`
        UPDATE bookings SET
          apartment_id = $2, guest_email = $3, guest_phone = $4, num_guests = $5,
          start_date = $6, end_date = $7, status = $8,
          total_price = $9, is_deposit_paid = $10
        WHERE id = $1
      `, [
        snakeCaseBooking.id, snakeCaseBooking.apartment_id, snakeCaseBooking.guest_email, snakeCaseBooking.guest_phone,
        snakeCaseBooking.num_guests, snakeCaseBooking.start_date, snakeCaseBooking.end_date, snakeCaseBooking.status,
        snakeCaseBooking.total_price, snakeCaseBooking.is_deposit_paid
      ]);
    }
    await client.query('COMMIT');
    const result = await pool.query('SELECT * FROM bookings'); // Return all bookings, or just the updated ones. Returning all for now.
    res.json(snakeToCamel<Booking[]>(result.rows));
  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to update bookings', details: err.message });
  } finally {
    client.release();
  }
});

// Manage Bookings status update (original route, now using snakeToCamel for response)
app.patch('/api/v1/bookings/:id/status', async (req, res) => {
  const id = req.params.id;

  const { status } = req.body;
  try {
    const result = await pool.query('UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    res.json(snakeToCamel<Booking>(result.rows[0]));
  } catch (err: any) {
    res.status(400).json({ error: 'Status update failed', details: err.message });
  }
});

// New endpoint to update apartments
app.put('/api/v1/apartments', async (req, res) => {
  const updatedApartments: Apartment[] = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const a of updatedApartments) {
      const snakeCaseApartment = camelToSnake(a);
      await client.query(`
        UPDATE apartments SET
          host_id = $2, title = $3, description = $4,
          city = $5, address = $6, capacity = $7,
          bedrooms = $8, bathrooms = $9, price_per_night = $10,
          price_overrides = $11, amenities = $12, photos = $13,
          is_active = $14
        WHERE id = $1
      `, [
        snakeCaseApartment.id, snakeCaseApartment.host_id, snakeCaseApartment.title, snakeCaseApartment.description,
        snakeCaseApartment.city, snakeCaseApartment.address, snakeCaseApartment.capacity,
        snakeCaseApartment.bedrooms, snakeCaseApartment.bathrooms, snakeCaseApartment.price_per_night,
        JSON.stringify(snakeCaseApartment.price_overrides), JSON.stringify(snakeCaseApartment.amenities), JSON.stringify(snakeCaseApartment.photos),
        snakeCaseApartment.is_active
      ]);
    }
    await client.query('COMMIT');
    const result = await pool.query('SELECT * FROM apartments');
    res.json(snakeToCamel<Apartment[]>(result.rows));
  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to update apartments', details: err.message });
  } finally {
    client.release();
  }
});

// Manage Availability (toggle) - original route, now using snakeToCamel for response
app.post('/api/v1/availability/toggle', async (req, res) => {
  const { apartmentId, date } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM blocked_dates WHERE apartment_id = $1 AND date = $2', [apartmentId, date]);
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM blocked_dates WHERE id = $1', [existing.rows[0].id]);
      res.json({ status: 'removed' });
    } else {
      await pool.query('INSERT INTO blocked_dates (id, apartment_id, date) VALUES ($1, $2, $3)', [`block-${Date.now()}`, apartmentId, date]);
      res.json({ status: 'added' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Toggle failed', details: err.message });
  }
});

// New endpoint to update all blocked dates
app.put('/api/v1/blocked-dates', async (req, res) => {
  const updatedBlockedDates: BlockedDate[] = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // For simplicity, we'll delete all existing blocked dates and re-insert the provided list.
    // In a more complex app, you might only update/delete specific ones.
    await client.query('DELETE FROM blocked_dates');
    for (const d of updatedBlockedDates) {
      const snakeCaseBlockedDate = camelToSnake(d);
      await client.query(`
        INSERT INTO blocked_dates (id, apartment_id, date, reason)
        VALUES ($1, $2, $3, $4)
      `, [snakeCaseBlockedDate.id, snakeCaseBlockedDate.apartment_id, snakeCaseBlockedDate.date, snakeCaseBlockedDate.reason]);
    }
    await client.query('COMMIT');
    const result = await pool.query('SELECT * FROM blocked_dates');
    res.json(snakeToCamel<BlockedDate[]>(result.rows));
  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to update blocked dates', details: err.message });
  } finally {
    client.release();
  }
});

app.listen(port, () => {
  console.log(`Boutique Backend running on port ${port}`);

  app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});
});