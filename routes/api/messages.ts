
import { Router } from 'express';
import { body } from 'express-validator';
import { pool, keysToCamel } from '../../db';
import { validate } from '../../middleware/validation';
import { protect, Request } from '../../middleware/auth';
import { sendEmail } from '../../services/email';

const router = Router();

const sendMessage = async (req: Request, res, next, messageType: 'check-in' | 'welcome' | 'checkout') => {
    const { bookingId } = req.params;
    const hostId = req.user.id;

    try {
        const client = await pool.connect();

        const bookingPromise = client.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
        const hostPromise = client.query('SELECT * FROM hosts WHERE user_id = $1', [hostId]);
        
        const [bookingResult, hostResult] = await Promise.all([bookingPromise, hostPromise]);

        if (bookingResult.rows.length === 0) {
            client.release();
            return res.status(404).json({ error: 'Booking not found' });
        }
        const booking = bookingResult.rows[0];

        if (hostResult.rows.length === 0) {
            client.release();
            return res.status(404).json({ error: 'Host not found' });
        }
        const host = hostResult.rows[0];

        const apartmentResult = await client.query('SELECT * FROM apartments WHERE id = $1', [booking.apartment_id]);
        if (apartmentResult.rows.length === 0) {
            client.release();
            return res.status(404).json({ error: 'Apartment not found for this booking' });
        }
        const apartment = apartmentResult.rows[0];

        if (apartment.host_id !== host.id) {
            client.release();
            return res.status(403).json({ error: 'You are not authorized to send a message for this booking.' });
        }

        client.release();

        let subject = '';
        let template = '';

        switch (messageType) {
            case 'check-in':
                subject = `Check-in instructions for your booking at ${apartment.title}`;
                template = 'CheckInMessage';
                break;
            case 'welcome':
                subject = `Welcome to ${apartment.title}!`;
                template = 'WelcomeMessage';
                break;
            case 'checkout':
                subject = `Checkout instructions for your booking at ${apartment.title}`;
                template = 'CheckoutMessage';
                break;
        }


        await sendEmail(
            booking.guest_email,
            subject,
            template,
            {
                booking: keysToCamel(booking),
                apartment: keysToCamel(apartment),
                host: keysToCamel(host),
            }
        );

        res.status(200).json({ message: `${messageType} message sent successfully` });

    } catch (error) {
        next(error);
    }
};

router.post('/:bookingId/check-in', protect, (req: Request, res, next) => sendMessage(req, res, next, 'check-in'));
router.post('/:bookingId/welcome', protect, (req: Request, res, next) => sendMessage(req, res, next, 'welcome'));
router.post('/:bookingId/checkout', protect, (req: Request, res, next) => sendMessage(req, res, next, 'checkout'));


router.post('/', 
    protect,
    body('bookingId').isString().notEmpty(),
    body('message').not().isEmpty().trim().escape(),
    validate,
    async (req: Request, res, next) => {
        const { bookingId, message } = req.body;
        const hostId = req.user.id;

        try {
            const client = await pool.connect();

            const bookingPromise = client.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
            const hostPromise = client.query('SELECT * FROM hosts WHERE user_id = $1', [hostId]);
            
            const [bookingResult, hostResult] = await Promise.all([bookingPromise, hostPromise]);

            if (bookingResult.rows.length === 0) {
                client.release();
                return res.status(404).json({ error: 'Booking not found' });
            }
            const booking = bookingResult.rows[0];

            if (hostResult.rows.length === 0) {
                client.release();
                return res.status(404).json({ error: 'Host not found' });
            }
            const host = hostResult.rows[0];

            const apartmentResult = await client.query('SELECT * FROM apartments WHERE id = $1', [booking.apartment_id]);
            if (apartmentResult.rows.length === 0) {
                client.release();
                return res.status(404).json({ error: 'Apartment not found for this booking' });
            }
            const apartment = apartmentResult.rows[0];

            if (apartment.host_id !== host.id) {
                client.release();
                return res.status(403).json({ error: 'You are not authorized to send a message for this booking.' });
            }

            client.release();

            await sendEmail(
                booking.guest_email,
                `Message from ${host.business_name || host.name} regarding your booking for ${apartment.title}`,
                'DirectMessage',
                {
                    booking: keysToCamel(booking),
                    apartment: keysToCamel(apartment),
                    host: keysToCamel(host),
                    message
                }
            );

            res.status(200).json({ message: 'Message sent successfully' });

        } catch (error) {
            next(error);
        }
    }
);

export default router;
