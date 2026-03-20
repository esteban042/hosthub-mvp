
import { Router } from 'express';
import { body, query } from 'express-validator';
import { pool } from '../../db.js';
import { keysToCamel } from '../../dputils.js';
import { validate } from '../../middleware/validation.js';
import { protect, AuthRequest } from '../../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { UserRole, Apartment } from '../../types.js';

const router = Router();

// GET /host-dashboard - Fetches all data needed for the host dashboard.
router.get('/host-dashboard', protect, async (req: AuthRequest, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required.' });

  const userId = req.user.id;
  const client = await pool.connect();

  try {
    const hostRes = await client.query('SELECT * FROM hosts WHERE user_id = $1', [userId]);
    if (hostRes.rows.length === 0) {
      return res.status(404).json({ error: 'Host profile not found for this user. Please create a host profile.' });
    }
    const host = hostRes.rows[0];

    const apartmentsRes = await client.query('SELECT * FROM apartments WHERE host_id = $1', [host.id]);
    const apartments: Apartment[] = apartmentsRes.rows;
    const apartmentIds = apartments.map((apt: Apartment) => apt.id);

    let bookings = [];
    let blockedDates = [];

    if (apartmentIds.length > 0) {
      const bookingsRes = await client.query('SELECT * FROM bookings WHERE apartment_id = ANY($1::text[])', [apartmentIds]);
      bookings = bookingsRes.rows;

      const blockedDatesRes = await client.query('SELECT * FROM blocked_dates WHERE apartment_id = ANY($1::text[])', [apartmentIds]);
      blockedDates = blockedDatesRes.rows;
    }

    res.json(keysToCamel({ host, apartments, bookings, blockedDates }));

  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
});

// GET /landing-data - Fetches data for public landing pages.
router.get('/landing-data',
  query('slug').optional().isString(),
  query('email').optional().isEmail(),
  query('isGuest').optional().isBoolean(),
  validate,
  async (req, res, next) => {
    const { slug, email, isGuest } = req.query as any;
    const client = await pool.connect();

    try {
      let hostQueryText = 'SELECT';
      if (isGuest === 'true') {
        hostQueryText += ' id, slug, name, bio, avatar, business_name, landing_page_picture, premium_config, country, payment_instructions';
      } else {
        hostQueryText += ' *';
      }
      hostQueryText += ' FROM hosts';
      const hostQueryParams = [];

      if (slug) {
        hostQueryText += ' WHERE slug = $1';
        hostQueryParams.push(slug as string);
      } else if (email) {
        hostQueryText += ' WHERE contact_email = $1';
        hostQueryParams.push(email as string);
      } else {
        hostQueryText += ' LIMIT 1';
      }

      const hostRes = await client.query(hostQueryText, hostQueryParams);

      if (hostRes.rows.length === 0) {
        return res.status(404).json({ error: 'Host not found' });
      }
      const host = hostRes.rows[0];

      const apartmentsRes = await client.query('SELECT * FROM apartments WHERE host_id = $1', [host.id]);
      const apartments: Apartment[] = apartmentsRes.rows;
      const apartmentIds = apartments.map((apt: Apartment) => apt.id);

      let bookings = [];
      let blockedDates = [];

      if (apartmentIds.length > 0) {
        const bookingSelect = isGuest === 'true' ? 'apartment_id, start_date, end_date' : '*';
        const bookingsRes = await client.query(`SELECT ${bookingSelect} FROM bookings WHERE apartment_id = ANY($1::text[])`, [apartmentIds]);
        bookings = bookingsRes.rows;

        const blockedDatesRes = await client.query('SELECT * FROM blocked_dates WHERE apartment_id = ANY($1::text[])', [apartmentIds]);
        blockedDates = blockedDatesRes.rows;
      }

      res.json(keysToCamel({ host, apartments, bookings, blockedDates }));

    } catch (err) {
      next(err);
    } finally {
      client.release();
    }
});

// Creates a new single blocked date, or updates the source if it already exists.
// [VALIDATION TEMPORARILY REMOVED FOR DEBUGGING]
router.post('/blocked-dates',
  protect,
  async (req: AuthRequest, res, next) => {
    const { apartmentId, date, source } = req.body;
    const client = await pool.connect();
    const isAdmin = req.user?.role === UserRole.ADMIN;
    const userId = req.user?.id;

    try {
      if (!isAdmin) {
        const hostRes = await client.query('SELECT id FROM hosts WHERE user_id = $1', [userId]);
        if (hostRes.rows.length === 0) {
          return res.status(403).json({ error: 'You must have a host profile to block dates.' });
        }
        const userHostId = hostRes.rows[0].id;

        const aptRes = await client.query('SELECT host_id FROM apartments WHERE id = $1', [apartmentId]);
        if (aptRes.rows.length === 0) {
          return res.status(404).json({ error: `Apartment not found.` });
        }
        if (String(aptRes.rows[0].host_id) !== String(userHostId)) {
          return res.status(403).json({ error: `You are not authorized to block dates for this apartment.` });
        }
      }

      const newId = uuidv4();
      const queryText = `
        INSERT INTO blocked_dates (id, apartment_id, date, source)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (apartment_id, date) DO UPDATE SET source = EXCLUDED.source
        RETURNING *
      `;
      const insertRes = await client.query(queryText, [newId, apartmentId, date, source]);

      res.status(201).json(keysToCamel(insertRes.rows[0]));

    } catch (err) {
      next(err);
    } finally {
      client.release();
    }
});

// Deletes a single blocked date by its unique ID.
// [VALIDATION TEMPORARILY REMOVED FOR DEBUGGING]
router.delete('/blocked-dates',
  protect,
  async (req: AuthRequest, res, next) => {
    const { id } = req.body;
    const client = await pool.connect();
    const isAdmin = req.user?.role === UserRole.ADMIN;
    const userId = req.user?.id;

    try {
      const blockedDateRes = await client.query('SELECT apartment_id, source FROM blocked_dates WHERE id = $1', [id]);
      if (blockedDateRes.rows.length === 0) {
        return res.status(404).json({ error: 'Blocked date not found. It may have already been deleted.' });
      }
      const { apartment_id, source } = blockedDateRes.rows[0];

      if (source === 'ICAL') {
        return res.status(400).json({ error: 'iCal-synced dates cannot be manually unblocked.' });
      }

      if (!isAdmin) {
        const hostRes = await client.query('SELECT id FROM hosts WHERE user_id = $1', [userId]);
        if (hostRes.rows.length === 0) {
          return res.status(403).json({ error: 'You must have a host profile to unblock dates.' });
        }
        const userHostId = hostRes.rows[0].id;

        const aptRes = await client.query('SELECT host_id FROM apartments WHERE id = $1', [apartment_id]);
        if (String(aptRes.rows[0].host_id) !== String(userHostId)) {
          return res.status(403).json({ error: `You are not authorized to unblock dates for this apartment.` });
        }
      }

      await client.query('DELETE FROM blocked_dates WHERE id = $1', [id]);
      res.status(200).json({ message: 'Blocked date deleted successfully' });

    } catch (err) {
      next(err);
    } finally {
      client.release();
    }
});

export default router;
