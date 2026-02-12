
import { Router } from 'express';
import { body, param } from 'express-validator';
import bcrypt from 'bcryptjs';
import { pool, keysToCamel } from '../db';
import { validate } from '../middleware/validation';
import { protect, Request } from '../middleware/auth';
import { sendEmail } from '../services/email';

const router = Router();

router.post('/apartments', 
  protect,
  body('name').not().isEmpty().trim().escape(),
  body('description').not().isEmpty().trim().escape(),
  body('price').isFloat({ gt: 0 }),
  body('location').not().isEmpty().trim().escape(),
  validate,
  async (req, res, next) => {
    res.status(501).send('Not Implemented');
});

router.get('/apartments/:id', 
  param('id').isString().notEmpty(),
  validate,
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      const { id } = req.params;
      const result = await client.query('SELECT * FROM apartments WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Apartment not found' });
      }
      res.json(keysToCamel(result.rows[0]));
    } catch (err) {
      next(err);
    } finally {
      client.release();
    }
});

router.post('/bookings', 
  body('apartmentId').isString().notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('guestEmail').isEmail().normalizeEmail(),
  body('guestName').not().isEmpty().trim().escape(),
  body('guestCountry').not().isEmpty().trim().escape(),
  body('guestPhone').optional().trim().escape(),
  body('numGuests').isInt({ gt: 0 }),
  body('guestMessage').optional().trim().escape(),
  validate,
  async (req: Request, res, next) => {
    const {
      apartmentId, startDate, endDate, guestEmail, guestName, guestCountry, guestPhone, numGuests, guestMessage
    } = req.body;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const apartmentRes = await client.query('SELECT * FROM apartments WHERE id = $1 FOR UPDATE', [apartmentId]);

      if (apartmentRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Apartment not found' });
      }
      const apartment = apartmentRes.rows[0];

      const hostRes = await client.query('SELECT * FROM hosts WHERE id = $1', [apartment.host_id]);
      if (hostRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Host for this apartment not found' });
      }
      const host = hostRes.rows[0];

      const bookingCountRes = await client.query('SELECT COUNT(b.id) FROM bookings b JOIN apartments a ON b.apartment_id = a.id WHERE a.host_id = $1', [host.id]);
      const bookingCount = parseInt(bookingCountRes.rows[0].count, 10);

      const hostInitials = (host.name.match(/\b(\w)/g) || ['H', 'H']).join('').toUpperCase();
      const customBookingId = `${hostInitials}${String(bookingCount + 1).padStart(7, '0')}`;

      const overlappingBookingsRes = await client.query(
        `SELECT 1 FROM bookings WHERE apartment_id = $1 AND status != 'cancelled' AND (start_date, end_date) OVERLAPS ($2, $3)`,
        [apartmentId, startDate, endDate]
      );

      if (overlappingBookingsRes.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: 'The selected dates are not available' });
      }

      const nights = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
      const totalPrice = nights * apartment.price_per_night;

      const bookingRes = await client.query(
        `INSERT INTO bookings (apartment_id, start_date, end_date, total_price, status, guest_name, guest_email, guest_country, guest_phone, num_guests, guest_message, custom_booking_id)
         VALUES ($1, $2, $3, $4, 'confirmed', $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [apartmentId, startDate, endDate, totalPrice, guestName, guestEmail, guestCountry, guestPhone, numGuests, guestMessage, customBookingId]
      );
      const newBooking = bookingRes.rows[0];

      await client.query('COMMIT');

      res.status(201).json(keysToCamel(newBooking));

    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
});

router.get('/bookings/:id', 
  protect,
  param('id').isString().notEmpty(),
  validate,
  async (req: Request, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT
          b.id AS booking_id,
          b.start_date,
          b.end_date,
          b.total_price,
          b.status,
          b.guest_name, 
          b.guest_email, 
          b.guest_country, 
          b.guest_phone, 
          b.num_guests, 
          b.guest_message,
          a.id AS apartment_id,
          a.name AS apartment_name,
          a.description AS apartment_description,
          a.location AS apartment_location,
          h.id AS host_id,
          u.id as host_user_id
        FROM
          bookings b
        JOIN
          apartments a ON b.apartment_id = a.id
        JOIN
          hosts h ON a.host_id = h.id
        LEFT JOIN
          users u ON h.user_id = u.id
        WHERE
          b.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const booking = result.rows[0];

      if (!req.user || booking.host_user_id !== req.user.id) {
        return res.status(403).json({ error: 'You are not authorized to view this booking' });
      }

      res.json(keysToCamel(booking));
    } catch (err) {
      next(err);
    } finally {
      client.release();
    }
});

router.post('/users', 
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  validate,
  async (req, res, next) => {
    const { email, password } = req.body;
    const client = await pool.connect();
    try {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const result = await client.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role',
        [email, passwordHash]
      );

      const newUser = result.rows[0];
      res.status(201).json(keysToCamel(newUser));

    } catch (err: any) {
      if (err.code === '23505') { 
        return res.status(409).json({ error: 'A user with this email already exists.' });
      }
      next(err);
    } finally {
      client.release();
    }
});

router.get('/host-dashboard', protect, async (req: Request, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required.' });

  const userId = req.user.id;
  const client = await pool.connect();

  try {
    const hostRes = await client.query('SELECT * FROM hosts WHERE user_id::text = $1', [userId]);
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

router.post('/send-email', 
  body('toEmail').isEmail().normalizeEmail(),
  body('subject').not().isEmpty().trim().escape(),
  body('templateName').isIn(['BookingConfirmation', 'BookingCancellation']),
  body('booking').isObject(),
  body('apartment').isObject(),
  body('host').isObject(),
  validate,
  async (req, res, next) => {
    const { toEmail, subject, templateName, ...data } = req.body;
    try {
      const result = await sendEmail(toEmail, subject, templateName, data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
});

export default router;
