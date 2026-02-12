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
  param('id').isInt(),
  validate,
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      const { id } = req.params;
      const result = await client.query('SELECT * FROM apartments WHERE id::text = $1', [id]);
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
  body('apartmentId').isInt(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  validate,
  async (req, res, next) => {
    res.status(501).send('Not Implemented');
});

router.get('/bookings/:id', 
  param('id').isInt(),
  validate,
  async (req, res, next) => {
    res.status(501).send('Not Implemented');
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
    const hostRes = await client.query('SELECT * FROM hosts WHERE user_id = $1', [userId]);
    if (hostRes.rows.length === 0) {
      return res.status(404).json({ error: 'Host profile not found for this user.' });
    }
    const host = hostRes.rows[0];

    const apartmentsRes = await client.query('SELECT * FROM apartments WHERE host_id = $1', [host.id]);
    const apartments = apartmentsRes.rows;
    const apartmentIds = apartments.map(apt => apt.id);

    let bookings = [];
    let blockedDates = [];

    if (apartmentIds.length > 0) {
      const bookingsRes = await client.query('SELECT * FROM bookings WHERE apartment_id = ANY($1)', [apartmentIds]);
      bookings = bookingsRes.rows;

      const blockedDatesRes = await client.query('SELECT * FROM blocked_dates WHERE apartment_id = ANY($1)', [apartmentIds]);
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
