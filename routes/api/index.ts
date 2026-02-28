import { Router, Request as ExpressRequest, Response, NextFunction } from 'express';
import { body, query as queryValidator } from 'express-validator';
import { pool } from '../../db.js';
import { query } from '../../dputils.js';
import { keysToCamel } from '../../dputils.js';
import { validate } from '../../middleware/validation.js';
import { protect, AuthRequest } from '../../middleware/auth.js';
import { sendEmail } from '../../services/email.js';
import { v4 as uuidv4 } from 'uuid';
import { UserRole, Host, Apartment, Booking, BlockedDate } from '../../types.js';

import apartmentsRouter from './apartments.js';
import bookingsRouter from './bookings.js';
import hostsRouter from './hosts.js';
import usersRouter from './users.js';
import availabilityRouter from './availability.js';
import messagesRouter from './messages.js';
import viewsRouter from './views.js';
import adminRouter from './admin.js';
import stripeRouter from './stripe.js';
import importerRouter from './importer.js';
import filesRouter from '../files.js';

const router = Router();

// Resource-specific routers
router.use('/apartments', apartmentsRouter);
router.use('/bookings', bookingsRouter);
router.use('/hosts', hostsRouter);
router.use('/users', usersRouter);
router.use('/availability', availabilityRouter);
router.use('/messages', messagesRouter);
router.use('/views', viewsRouter);
router.use('/admin-dashboard', adminRouter);
router.use('/stripe', stripeRouter);
router.use('/import', importerRouter);
router.use('/files', filesRouter);

// --- Routes originally from misc.ts ---

router.post('/send-email',
  body('toEmail').isEmail().normalizeEmail(),
  body('subject').not().isEmpty().trim().escape(),
  body('templateName').isIn(['BookingConfirmation', 'BookingCancellation', 'DirectMessage']),
  body('booking').isObject(),
  body('apartment').isObject(),
  body('host').isObject(),
  validate,
  async (req: ExpressRequest, res: Response, next: NextFunction) => {
    const { toEmail, subject, templateName, ...data } = req.body;
    try {
      const result = await sendEmail(toEmail, subject, templateName, data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
});

router.post('/send-message',
  protect,
  body('booking').isObject(),
  body('message').not().isEmpty().trim().escape(),
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { booking, message } = req.body;
    const hostId = req.user!.id;

    try {
      const hostResult = await query<Host>('SELECT * FROM hosts WHERE id = $1', [hostId]);
      const host = hostResult.rows[0];

      if (!host) {
        return res.status(404).json({ error: 'Host not found' });
      }

      const apartmentResult = await query<Apartment>('SELECT * FROM apartments WHERE id = $1', [booking.apartmentId]);
      const apartment = apartmentResult.rows[0];

      if (!apartment) {
        return res.status(404).json({ error: 'Apartment not found' });
      }

      const result = await sendEmail(
        booking.guestEmail,
        `Message from ${host.name} regarding your booking`,
        'DirectMessage',
        { booking, message, host, apartment }
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/public-hosts',
  async (req: ExpressRequest, res: Response, next: NextFunction) => {
    try {
      const result = await query('SELECT slug, name FROM hosts');
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
});


// --- Routes originally from blocked-dates.ts ---

router.get('/host-dashboard', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required.' });

  const userId = req.user.id;

  try {
    const hostRes = await query<Host>('SELECT * FROM hosts WHERE user_id = $1', [userId]);
    if (hostRes.rows.length === 0) {
      return res.status(404).json({ error: 'Host profile not found for this user. Please create a host profile.' });
    }
    const host = keysToCamel(hostRes.rows[0]);

    const apartmentsRes = await query<Apartment>('SELECT * FROM apartments WHERE host_id = $1', [host.id]);
    const apartments = apartmentsRes.rows.map(apt => {
        const camelApt = keysToCamel(apt);
        if (camelApt.pricePerNight) {
            camelApt.pricePerNight = parseFloat(camelApt.pricePerNight as string);
        }
        return camelApt;
    });
    const apartmentIds = apartments.map(apt => apt.id);

    let bookings: Booking[] = [];
    let blockedDates: BlockedDate[] = [];

    if (apartmentIds.length > 0) {
      const bookingsRes = await query<any>('SELECT * FROM bookings WHERE apartment_id = ANY($1::text[])', [apartmentIds]);
      bookings = bookingsRes.rows.map(booking => {
          const camelBooking = keysToCamel(booking);
          if (camelBooking.totalPrice) {
              camelBooking.totalPrice = parseFloat(camelBooking.totalPrice);
          }
          return camelBooking;
      });

      const blockedDatesRes = await query<BlockedDate>('SELECT * FROM blocked_dates WHERE apartment_id = ANY($1::text[])', [apartmentIds]);
      blockedDates = blockedDatesRes.rows.map(date => keysToCamel(date));
    }

    res.json({ host, apartments, bookings, blockedDates });

  } catch (err) {
    next(err);
  }
});

router.get('/landing-data',
  queryValidator('slug').optional().isString(),
  queryValidator('email').optional().isEmail(),
  queryValidator('isGuest').optional().isBoolean(),
  validate,
  async (req: ExpressRequest, res: Response, next: NextFunction) => {
    const { slug, email, isGuest } = req.query;

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

      const hostRes = await query<Host>(hostQueryText, hostQueryParams);

      if (hostRes.rows.length === 0) {
        return res.status(404).json({ error: 'Host not found' });
      }
      const host = hostRes.rows[0];

      const apartmentsRes = await query<Apartment>('SELECT * FROM apartments WHERE host_id = $1', [host.id]);
      const apartments = apartmentsRes.rows;
      const apartmentIds = apartments.map(apt => apt.id);

      let bookings: Booking[] = [];
      let blockedDates: BlockedDate[] = [];

      if (apartmentIds.length > 0) {
        const bookingSelect = isGuest === 'true' ? 'apartment_id, start_date, end_date' : '*';
        const bookingsRes = await query<Booking>(`SELECT ${bookingSelect} FROM bookings WHERE apartment_id = ANY($1::text[])`, [apartmentIds]);
        bookings = bookingsRes.rows;

        const blockedDatesRes = await query<BlockedDate>('SELECT * FROM blocked_dates WHERE apartment_id = ANY($1::text[])', [apartmentIds]);
        blockedDates = blockedDatesRes.rows;
      }

      res.json({ host, apartments, bookings, blockedDates });

    } catch (err) {
      next(err);
    }
});


router.post('/blocked-dates',
  protect,
  body().isArray(),
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const blockedDates = req.body;
    const client = await pool.connect();
    const isAdmin = req.user?.role === UserRole.ADMIN;
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
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const blockedDatesToDelete = req.body;
    const client = await pool.connect();
    const isAdmin = req.user?.role === UserRole.ADMIN;
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
