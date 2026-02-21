import { Router } from 'express';
import { protect, AuthRequest } from '../../middleware/auth.js';
import { UserRole } from '../../types.js';
import { pool } from '../../db.js';
import { keysToCamel } from '../../dputils.js';

const router = Router();

router.get('/', protect, async (req: AuthRequest, res, next) => {
  if (req.user?.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'You are not authorized to view this information.' });
  }

  const client = await pool.connect();

  try {
    const hostsRes = await client.query('SELECT * FROM hosts');
    const hosts = hostsRes.rows;

    const apartmentsRes = await client.query('SELECT * FROM apartments');
    const apartments = apartmentsRes.rows;

    const bookingsRes = await client.query('SELECT * FROM bookings');
    const bookings = bookingsRes.rows;

    res.json(keysToCamel({ hosts, apartments, bookings }));

  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
});

export default router;
