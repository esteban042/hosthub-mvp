import { Router, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../../middleware/validation.js';
import { protect, AuthRequest } from '../../middleware/auth.js';
import { 
    getAllBookings, 
    createBooking, 
    getBookingDetailsById, 
    updateBookings,
    getBookingById
} from '../../services/booking.service.js';
import { UserRole, BookingStatus } from '../../types.js';

const router = Router();

// GET /api/bookings - Admin only
router.get('/', 
    protect, 
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (req.user?.role !== UserRole.ADMIN) {
            return res.status(403).json({ error: 'You are not authorized to view this information.' });
        }
        try {
            const bookings = await getAllBookings();
            res.json(bookings);
        } catch (err) {
            next(err);
        }
    }
);

// POST /api/bookings - Create a new booking
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
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const newBooking = await createBooking(req.body);
            res.status(201).json(newBooking);
        } catch (err: any) {
            if (err.message.includes('not available')) {
                return res.status(409).json({ error: err.message });
            } else if (err.message.includes('minimum stay')) {
                return res.status(400).json({ error: err.message });
            }
            next(err);
        }
    }
);

// GET /api/bookings/:id - Get booking details
router.get('/:id', 
    protect,
    param('id').isString().notEmpty(),
    validate,
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const booking = await getBookingDetailsById(id);
            if (!booking) {
                return res.status(404).json({ error: 'Booking not found' });
            }

            if (req.user?.role !== UserRole.ADMIN && String(booking.hostUserId) !== String(req.user?.id)) {
                return res.status(403).json({ error: 'You are not authorized to view this booking' });
            }

            res.json(booking);
        } catch (err) {
            next(err);
        }
    }
);

// PUT /api/bookings/ - Bulk update bookings
router.put('/', 
    protect,
    body().isArray(),
    validate,
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        const updatedBookingsData = req.body;
        try {
            const result = await updateBookings(updatedBookingsData, req.user!);
            res.status(200).json(result);
        } catch (err: any) {
            if (err.message.includes('not authorized') || err.message.includes('do not have a host profile')) {
                return res.status(403).json({ error: err.message });
            } else if (err.message.includes('not found')) {
                return res.status(404).json({ error: err.message });
            }
            next(err);
        }
    }
);

// PUT /api/bookings/:id/cancel - Cancel a booking
router.put('/:id/cancel',
    protect,
    param('id').isString().notEmpty(),
    validate,
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const bookingToCancel = await getBookingById(id, req.user!); 

            if (!bookingToCancel) {
                 return res.status(404).json({ error: 'Booking not found' });
            }
            
            const updatedBooking = {
                ...bookingToCancel,
                status: BookingStatus.CANCELED,
            };

            const result = await updateBookings([updatedBooking], req.user!);
            res.status(200).json(result[0]);

        } catch (err: any) {
            if (err.message.includes('not authorized')) {
                return res.status(403).json({ error: err.message });
            } else if (err.message.includes('not found')) {
                return res.status(404).json({ error: err.message });
            }
            next(err);
        }
    }
);

export default router;
