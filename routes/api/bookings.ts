import { Router } from 'express';
import { body, param } from 'express-validator';
import { pool, keysToCamel } from '../../db';
import { validate } from '../../middleware/validation';
import { protect, Request } from '../../middleware/auth';
import { sendEmail } from '../../services/email';

const router = Router();

// Route for admins to get all bookings
router.get('/', protect, async (req: Request, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'You are not authorized to view this information.' });
  }
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM bookings');
    client.release();
    res.json(keysToCamel(result.rows));
  } catch (err) {
    next(err);
  }
});

router.post('/', 
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
      const apartment = keysToCamel(apartmentRes.rows[0]);

      const hostRes = await client.query('SELECT * FROM hosts WHERE id = $1', [apartment.hostId]);
      if (hostRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Host for this apartment not found' });
      }
      const host = keysToCamel(hostRes.rows[0]);

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
      const totalPrice = nights * apartment.pricePerNight;

      const bookingRes = await client.query(
        `INSERT INTO bookings (apartment_id, start_date, end_date, total_price, status, guest_name, guest_email, guest_country, guest_phone, num_guests, guest_message, custom_booking_id)
         VALUES ($1, $2, $3, $4, 'confirmed', $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [apartmentId, startDate, endDate, totalPrice, guestName, guestEmail, guestCountry, guestPhone, numGuests, guestMessage, customBookingId]
      );
      const newBooking = keysToCamel(bookingRes.rows[0]);

      await client.query('COMMIT');

      res.status(201).json(newBooking);

      // TODO: Add a feature flag to enable/disable this feature
      try {
        await sendEmail(
          newBooking.guestEmail,
          'Your Booking Confirmation',
          'BookingConfirmation',
          {
            booking: newBooking,
            apartment,
            host
          }
        );
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
});

router.get('/:id', 
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

router.put('/',
  protect,
  body().isArray(),
  validate,
  async (req: Request, res, next) => {
    const updatedBookings = req.body;
    const client = await pool.connect();
    const isAdmin = req.user?.role === 'admin';
    const userId = req.user?.id;

    try {
      if (!isAdmin) {
        const hostRes = await client.query('SELECT id FROM hosts WHERE user_id = $1', [userId]);
        if (hostRes.rows.length === 0) {
          return res.status(403).json({ error: 'You do not have a host profile and cannot update bookings.' });
        }
        const userHostId = hostRes.rows[0].id;

        for (const booking of updatedBookings) {
          const bookingRes = await client.query('SELECT apartment_id FROM bookings WHERE id = $1', [booking.id]);
          if (bookingRes.rows.length === 0) {
            return res.status(404).json({ error: `Booking with id ${booking.id} not found.` });
          }
          const apartmentId = bookingRes.rows[0].apartment_id;
          const aptRes = await client.query('SELECT host_id FROM apartments WHERE id = $1', [apartmentId]);
          if (aptRes.rows.length === 0) {
            return res.status(404).json({ error: `Apartment with id ${apartmentId} not found.` });
          }
          if (String(aptRes.rows[0].host_id) !== String(userHostId)) {
            return res.status(403).json({ error: `You are not authorized to update booking with id ${booking.id}.` });
          }
        }
      }

      await client.query('BEGIN');

      const resultBookings = [];
      for (const booking of updatedBookings) {
        const {
            guestName, guestEmail, guestCountry, numGuests, startDate, endDate, totalPrice, status, id
        } = booking;

        const updateRes = await client.query(
          `UPDATE bookings SET
            guest_name = $1, guest_email = $2, guest_country = $3, num_guests = $4,
            start_date = $5, end_date = $6, total_price = $7, status = $8
          WHERE id = $9 RETURNING *`,
          [guestName, guestEmail, guestCountry, numGuests, startDate, endDate, totalPrice, status, id]
        );
        resultBookings.push(keysToCamel(updateRes.rows[0]));
      }

      await client.query('COMMIT');
      res.status(200).json(resultBookings);

    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
});

export default router;
