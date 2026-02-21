import { Router } from 'express';
import { body, query } from 'express-validator';
import { pool } from '../../db.js';
import { keysToCamel } from '../../dputils.js';
import { validate } from '../../middleware/validation.js';
import { protect, AuthRequest } from '../../middleware/auth.js';
import { sendEmail } from '../../services/email.js';

const router = Router();

router.post('/send-email', 
  body('toEmail').isEmail().normalizeEmail(),
  body('subject').not().isEmpty().trim().escape(),
  body('templateName').isIn(['BookingConfirmation', 'BookingCancellation', 'DirectMessage']),
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

router.post('/send-message',
  protect,
  body('booking').isObject(),
  body('message').not().isEmpty().trim().escape(),
  validate,
  async (req: AuthRequest, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required to send messages.' });
    }
    const { booking, message } = req.body;
    const hostId = req.user.id;

    try {
      const client = await pool.connect();
      const hostResult = await client.query('SELECT * FROM hosts WHERE id = $1', [hostId]);
      const host = hostResult.rows[0];

      if (!host) {
        client.release();
        return res.status(404).json({ error: 'Host not found' });
      }

      const apartmentResult = await client.query('SELECT * FROM apartments WHERE id = $1', [booking.apartmentId]);
      const apartment = apartmentResult.rows[0];
      client.release();

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
  async (req, res, next) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT slug, name FROM hosts');
      client.release();
      res.json(keysToCamel(result.rows));
    } catch (err) {
      next(err);
    }
});

export default router;
