import { Router } from 'express';
import { body, query } from 'express-validator';
import { pool } from '../../db';
import { keysToCamel } from '../../dputils';
import { validate } from '../../middleware/validation';
import { protect, Request } from '../../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../../types';

const router = Router();

// These routes were moved here from misc.ts because they depend on blocked_dates
router.get('/host-dashboard', protect, async (req: Request, res, next) => {
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
    const apartments = apartmentsRes.rows;
    const apartmentIds = apartments.map(apt => apt.id);

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

router.get('/landing-data',
  query('slug').optional().isString(),
  query('email').optional().isEmail(),
  query('isGuest').optional().isBoolean(),
  validate,
  async (req, res, next) => {
    const { slug, email, isGuest } = req.query;
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
      const apartments = apartmentsRes.rows;
      const apartmentIds = apartments.map(apt => apt.id);

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


router.post('/blocked-dates',
  protect,
  body().isArray(),
  validate,
  async (req: Request, res, next) => {
    const blockedDates = req.body;
    const client = await pool.connect();
    const isAdmin = req.user?.role === UserRole.Admin;
    const userId = req.user?.id;

    try {
      if (!isAdmin) {
        const hostRes = await client.query('SELECT id FROM hosts WHERE user_id = $1', [userId]);
        if (hostRes.rows.length === 0) {
          return res.status(403).json({ error: 'You do not have a host profile and cannot block dates.' });
        }
        const userHostId = hostRes.rows[0].id;

        for (const blockedDate of blockedDates) {
          const aptRes = await client.query('SELECT host_id FROM apartments WHERE id = $1', [blockedDate.apartmentId]);
          if (aptRes.rows.length === 0) {
             return res.status(404).json({ error: `Apartment with id ${blockedDate.apartmentId} not found.` });
          }
          if (String(aptRes.rows[0].host_id) !== String(userHostId)) {
             return res.status(403).json({ error: `You are not authorized to block dates for apartment with id ${blockedDate.apartmentId}.` });
          }
        }
      }

      await client.query('BEGIN');

      const resultBlockedDates = [];
      for (const blockedDate of blockedDates) {
        const { apartmentId, date } = blockedDate;
        const newId = uuidv4();
        const insertRes = await client.query(
          'INSERT INTO blocked_dates (id, apartment_id, date) VALUES ($1, $2, $3) RETURNING *',
          [newId, apartmentId, date]
        );
        resultBlockedDates.push(keysToCamel(insertRes.rows[0]));
      }

      await client.query('COMMIT');
      res.status(201).json(resultBlockedDates);

    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
});

router.delete('/blocked-dates',
  protect,
  body().isArray(),
  validate,
  async (req: Request, res, next) => {
    const blockedDatesToDelete = req.body;
    const client = await pool.connect();
    const isAdmin = req.user?.role === UserRole.Admin;
    const userId = req.user?.id;

    try {
      if (!isAdmin) {
        const hostRes = await client.query('SELECT id FROM hosts WHERE user_id = $1', [userId]);
        if (hostRes.rows.length === 0) {
          return res.status(403).json({ error: 'You do not have a host profile and cannot unblock dates.' });
        }
        const userHostId = hostRes.rows[0].id;

        for (const blockedDate of blockedDatesToDelete) {
            const aptRes = await client.query('SELECT host_id FROM apartments WHERE id = $1', [blockedDate.apartmentId]);
            if (aptRes.rows.length === 0) {
                return res.status(404).json({ error: `Apartment with id ${blockedDate.apartmentId} not found.` });
            }
            if (String(aptRes.rows[0].host_id) !== String(userHostId)) {
                return res.status(403).json({ error: `You are not authorized to unblock dates for apartment with id ${blockedDate.apartmentId}.` });
            }
        }
      }

      await client.query('BEGIN');

      for (const blockedDate of blockedDatesToDelete) {
        const { apartmentId, date } = blockedDate;
        await client.query(
          'DELETE FROM blocked_dates WHERE apartment_id = $1 AND date = $2',
          [apartmentId, date]
        );
      }

      await client.query('COMMIT');
      res.status(200).json({ message: 'Blocked dates deleted successfully' });

    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
});

export default router;
