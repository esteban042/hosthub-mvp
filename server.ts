
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
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
        avatar TEXT
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
        photos JSONB
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
  const subdomain = hostHeader.split('.')[0];
  
  try {
    // Attempt to find host by subdomain slug
    let hostResult = await pool.query('SELECT * FROM hosts WHERE slug = $1', [subdomain]);
    
    if (hostResult.rows.length === 0) {
      // Fallback for development/testing
      hostResult = await pool.query('SELECT * FROM hosts LIMIT 1');
    }

    if (hostResult.rows.length === 0) {
      return res.status(404).json({ error: 'No host configuration found. Please seed the database.' });
    }

    req.tenant = hostResult.rows[0];
    next();
  } catch (error) {
    res.status(500).json({ error: 'Tenant lookup failed' });
  }
};

// --- API ROUTES ---

// Initial Seeding Route
app.post('/api/v1/seed', async (req, res) => {
  try {
    const hostId = 'host-1';
    await pool.query(`
      INSERT INTO hosts (id, slug, name, bio, avatar) 
      VALUES ($1, 'alpine-getaways', 'Sarah Miller', 'Avid mountain explorer.', 'https://picsum.photos/seed/sarah/200/200')
      ON CONFLICT (id) DO NOTHING
    `, [hostId]);

    await pool.query(`
      INSERT INTO apartments (id, host_id, title, description, city, capacity, price_per_night, amenities, photos)
      VALUES 
      ('apt-1', $1, 'Modern Chalet', 'A beautiful timber chalet.', 'Grindelwald', 4, 250, '["Wifi", "Kitchen"]', '["https://picsum.photos/seed/chalet1/800/600"]'),
      ('apt-2', $1, 'Cozy Studio', 'Simple, clean studio.', 'Grindelwald', 1, 95, '["Wifi"]', '["https://picsum.photos/seed/studio/800/600"]')
      ON CONFLICT (id) DO NOTHING
    `, [hostId]);

    res.json({ message: 'Seed data successfully applied' });
  } catch (err) {
    res.status(500).json({ error: 'Seeding failed', details: err });
  }
});

// Get Public Landing Data
app.get('/api/v1/landing', tenantMiddleware, async (req: any, res) => {
  const hostId = req.tenant.id;
  try {
    const apartments = await pool.query('SELECT * FROM apartments WHERE host_id = $1', [hostId]);
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
