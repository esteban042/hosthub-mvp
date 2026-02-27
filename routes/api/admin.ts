import { Router } from 'express';
import { protect, AuthRequest } from '../../middleware/auth.js';
import { UserRole } from '../../types.js';
import { query } from '../../dputils.js';
import { Host, Apartment, Booking } from '../../types.js';

const router = Router();

router.get('/', protect, async (req: AuthRequest, res, next) => {
  if (req.user?.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'You are not authorized to view this information.' });
  }

  try {
    const hostsRes = await query<Host>('SELECT * FROM hosts');
    const hosts = hostsRes.rows;

    const apartmentsRes = await query<Apartment>('SELECT * FROM apartments');
    const apartments = apartmentsRes.rows;

    const bookingsRes = await query<Booking>('SELECT * FROM bookings');
    const bookings = bookingsRes.rows;

    res.json({ hosts, apartments, bookings });

  } catch (err) {
    next(err);
  }
});

export default router;
