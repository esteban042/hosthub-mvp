import { Router } from 'express';
import { body, query } from 'express-validator';
import { pool, keysToCamel } from '../../db';
import { validate } from '../../middleware/validation';
import { protect, Request } from '../../middleware/auth';
import { sendEmail } from '../../services/email';

const router = Router();

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
