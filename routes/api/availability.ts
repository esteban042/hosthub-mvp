import { Router } from 'express';
import { query } from 'express-validator';
import { pool, keysToCamel } from '../../db';
import { validate } from '../../middleware/validation';

const router = Router();

router.get('/', 
  query('apartmentId').isString().notEmpty(),
  validate,
  async (req, res, next) => {
    const { apartmentId } = req.query;

    try {
      const client = await pool.connect();

      const bookingsPromise = client.query(
        `SELECT apartment_id, status, start_date, end_date FROM bookings WHERE apartment_id = $1 AND status != 'cancelled'`,
        [apartmentId]
      );

      const blockedDatesPromise = client.query(
        `SELECT apartment_id, date FROM blocked_dates WHERE apartment_id = $1 OR apartment_id = 'all'`,
        [apartmentId]
      );

      const [bookingsResult, blockedDatesResult] = await Promise.all([bookingsPromise, blockedDatesPromise]);

      client.release();

      const availability = {
        bookings: keysToCamel(bookingsResult.rows),
        blockedDates: keysToCamel(blockedDatesResult.rows),
      };

      res.json(availability);

    } catch (err) {
      next(err);
    }
});

export default router;
