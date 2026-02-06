import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { SubscriptionType } from './types'; // Import SubscriptionType

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Database Configuration
// Note: In IONOS, ensure DATABASE_URL includes the ?sslmode=require if necessary
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.use(cors());
app.use(express.json());

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
        airbnb_calendar_link TEXT -- New column
      );
      CREATE TABLE IF NOT EXISTS apartments (
        id TEXT PRIMARY KEY,
        host_id TEXT REFERENCES hosts(id),
        title TEXT,
        description TEXT,
        city TEXT,
        capacity INT,
        price_per_night INT,
        amenities JSONB,
        photos JSONB,
        map_embed_url TEXT -- New column for map embed URL
      );
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        apartment_id TEXT REFERENCES apartments(id),
        guest_email TEXT,
        start_date DATE,
        end_date DATE,
        status TEXT,
        total_price INT
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
 * Multi-Tenant Middleware
 */
const tenantMiddleware = async (req: any, res: any, next: any) => {
  const hostHeader = req.headers.host || '';
  // Extract subdomain, handling potential 'www' prefix or direct IP/localhost
  let subdomain = hostHeader.split('.')[0];
  if (subdomain === 'www') { // If it's www.something.com, try to get the actual subdomain
    const parts = hostHeader.split('.');
    if (parts.length > 2) {
      subdomain = parts[0]; // e.g., 'www'
      if (parts[1] !== 'localhost') { // Check for common local dev domains
        subdomain = parts[0];
      } else {
        subdomain = 'alpine-getaways'; // Default for local dev without a specific subdomain
      }
    }
  } else if (subdomain === 'localhost' || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(subdomain)) {
     // If it's localhost or an IP, use a default slug for local development
     subdomain = 'alpine-getaways'; // or any default host slug for development
  }
  
  try {
    // Attempt to find host by subdomain slug
    let hostResult = await pool.query('SELECT * FROM hosts WHERE slug = $1', [subdomain]);
    
    if (hostResult.rows.length === 0) {
      // Fallback for development/testing if specific subdomain not found
      hostResult = await pool.query('SELECT * FROM hosts LIMIT 1');
    }

    if (hostResult.rows.length === 0) {
      return res.status(404).json({ error: 'No host configuration found. Please seed the database.' });
    }

    req.tenant = hostResult.rows[0];
    next();
  } catch (error) {
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
      VALUES ($1, 'alpine-getaways', 'Sarah Miller', 'Avid mountain explorer.', 'https://picsum.photos/seed/sarah/200/200', $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET 
        slug = EXCLUDED.slug, name = EXCLUDED.name, bio = EXCLUDED.bio, avatar = EXCLUDED.avatar, 
        subscription_type = EXCLUDED.subscription_type, commission_rate = EXCLUDED.commission_rate,
        contact_email = EXCLUDED.contact_email, physical_address = EXCLUDED.physical_address,
        country = EXCLUDED.country, phone_number = EXCLUDED.phone_number, notes = EXCLUDED.notes,
        airbnb_calendar_link = EXCLUDED.airbnb_calendar_link
    `, [hostId1, SubscriptionType.PRO, 4, 'sarah.miller@alpine.com', 'Via Cantonale 10, 3818 Grindelwald', 'Switzerland', '+41 79 123 45 67', 'Premium host, strong winter performance.', 'https://www.airbnb.com/calendar/ical/12345.ics?s=5a0d31b0e3e26f5d6f7b11d3']);

    const hostId2 = 'host-2';
    await pool.query(`
      INSERT INTO hosts (id, slug, name, bio, avatar, subscription_type, commission_rate, contact_email, physical_address, country, phone_number, notes, airbnb_calendar_link) 
      VALUES ($1, 'urban-retreats', 'James Chen', 'Architect focusing on minimalist urban living.', 'https://picsum.photos/seed/james/200/200', $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET 
        slug = EXCLUDED.slug, name = EXCLUDED.name, bio = EXCLUDED.bio, avatar = EXCLUDED.avatar, 
        subscription_type = EXCLUDED.subscription_type, commission_rate = EXCLUDED.commission_rate,
        contact_email = EXCLUDED.contact_email, physical_address = EXCLUDED.physical_address,
        country = EXCLUDED.country, phone_number = EXCLUDED.phone_number, notes = EXCLUDED.notes,
        airbnb_calendar_link = EXCLUDED.airbnb_calendar_link
    `, [hostId2, SubscriptionType.BASIC, 3, 'james.chen@urban.com', 'Shibuya 1-1, Tokyo', 'Japan', '+81 90 9876 5432', 'High-tech amenities, modern design.', 'https://www.airbnb.com/calendar/ical/67890.ics?s=c8f2a1e7d9b4c0a5f1e6b3a2']);

    const hostId3 = 'host-3';
    await pool.query(`
      INSERT INTO hosts (id, slug, name, bio, avatar, subscription_type, commission_rate, contact_email, physical_address, country, phone_number, notes, airbnb_calendar_link) 
      VALUES ($1, 'tuscan-sun', 'Elena Rossi', 'Third-generation villa manager.', 'https://picsum.photos/seed/elena/200/200', $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET 
        slug = EXCLUDED.slug, name = EXCLUDED.name, bio = EXCLUDED.bio, avatar = EXCLUDED.avatar, 
        subscription_type = EXCLUDED.subscription_type, commission_rate = EXCLUDED.commission_rate,
        contact_email = EXCLUDED.contact_email, physical_address = EXCLUDED.physical_address,
        country = EXCLUDED.country, phone_number = EXCLUDED.phone_number, notes = EXCLUDED.notes,
        airbnb_calendar_link = EXCLUDED.airbnb_calendar_link
    `, [hostId3, SubscriptionType.ENTERPRISE, 5, 'elena.rossi@tuscan.it', 'Via Chianti 50, 53100 Siena', 'Italy', '+39 333 1122334', 'Manages several high-end villas.', 'https://www.airbnb.com/calendar/ical/11223.ics?s=a9b8c7d6e5f4a3b2c1d0e9f8']);


    await pool.query(`
      INSERT INTO apartments (id, host_id, title, description, city, capacity, price_per_night, amenities, photos, map_embed_url)
      VALUES 
      ('apt-1', $1, 'Modern Chalet', 'A beautiful timber chalet.', 'Grindelwald', 4, 250, '["Wifi", "Kitchen"]', '["https://picsum.photos/seed/chalet1/800/600"]', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10839.839077209353!2d7.994236814675713!3d46.613304273874316!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478f7e2c9a9d7013%3A0xc0e0f3e6a0d6a0a0!2sGrindelwald%2C%20Switzerland!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus'),
      ('apt-2', $1, 'Cozy Studio', 'Simple, clean studio.', 'Grindelwald', 1, 95, '["Wifi"]', '["https://picsum.photos/seed/studio/800/600"]', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10839.839077209353!2d7.994236814675713!3d46.613304273874316!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478f7e2c9a9d7013%3A0xc0e0f3e6a0d6a0a0!2sGrindelwald%2C%20Switzerland!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus')
      ON CONFLICT (id) DO UPDATE SET map_embed_url = EXCLUDED.map_embed_url
    `, [hostId1]);

    await pool.query(`
      INSERT INTO apartments (id, host_id, title, description, city, capacity, price_per_night, amenities, photos, map_embed_url)
      VALUES 
      ('apt-3', $1, 'Minimalist Shibuya Loft', 'A sanctuary of light and shadow in Tokyo.', 'Tokyo', 2, 210, '["Wifi", "Air Conditioning", "Washer", "Kitchen"]', '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800&h=600"]', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12965.433221971714!2d139.69234839845348!3d35.66070624009714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x35ef4b64a13d702d%3A0x6b1c2b5d4e1a1b1a!2sShibuya%2C%20Tokyo%2C%20Japan!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2us')
      ON CONFLICT (id) DO UPDATE SET map_embed_url = EXCLUDED.map_embed_url
    `, [hostId2]);

    await pool.query(`
      INSERT INTO apartments (id, host_id, title, description, city, capacity, price_per_night, amenities, photos, map_embed_url)
      VALUES 
      ('apt-4', $1, 'Olive Grove Villa', 'Experience the soul of Tuscany in this 18th-century stone farmhouse.', 'Siena', 6, 450, '["Kitchen", "Free Parking", "Fireplace", "Washer", "Air Conditioning"]', 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&q=80&w=800&h=600', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2891.8906967011033!2d11.33230831557999!3d43.31885507913417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132bc2072129a7d3%3A0x959828e8a6096d24!2sSiena%2C%20Province%20of%20Siena%2C%20Italy!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2us')
      ON CONFLICT (id) DO UPDATE SET map_embed_url = EXCLUDED.map_embed_url
    `, [hostId3]);

    res.json({ message: 'Seed data successfully applied' });
  } catch (err) {
    res.status(500).json({ error: 'Seeding failed', details: err.message });
  }
});

// Get Public Landing Data
app.get('/api/v1/landing', tenantMiddleware, async (req: any, res) => {
  const hostId = req.tenant.id;
  try {
    // Select the new map_embed_url column
    const apartments = await pool.query('SELECT id, host_id, title, description, city, capacity, price_per_night, amenities, photos, map_embed_url FROM apartments WHERE host_id = $1', [hostId]);
    const aptIds = apartments.rows.map(a => a.id);
    
    const bookings = aptIds.length > 0 
      ? await pool.query('SELECT * FROM bookings WHERE apartment_id = ANY($1)', [aptIds])
      : { rows: [] };
      
    const blocks = await pool.query('SELECT * FROM blocked_dates WHERE apartment_id = \'all\' OR apartment_id = ANY($1)', [aptIds.length > 0 ? aptIds : ['none']]);
    
    res.json({
      host: req.tenant,
      apartments: apartments.rows,
      bookings: bookings.rows,
      blockedDates: blocks.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch landing data' });
  }
});

// Manage Bookings
app.patch('/api/v1/bookings/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query('UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Status update failed' });
  }
});

// Manage Availability
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
  } catch (err) {
    res.status(500).json({ error: 'Toggle failed' });
  }
});

app.listen(port, () => {
  console.log(`Boutique Backend running on port ${port}`);
});