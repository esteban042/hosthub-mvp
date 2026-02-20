import { Router } from 'express';
import { protect, Request } from '../../middleware/auth';
import { UserRole } from '../../types';
import { createStripeAccount, createStripeAccountLink } from '../../services/stripe.service';
import Stripe from 'stripe';
import { getBookingDetailsById } from '../../services/booking.service';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

router.post('/connect', protect, async (req: Request, res, next) => {
  try {
    if (!req.user || req.user.role !== UserRole.HOST) {
      return res.status(403).json({ error: 'You must be a host to connect to Stripe.' });
    }

    const accountId = await createStripeAccount(req.user.id);
    const accountLink = await createStripeAccountLink(accountId);

    res.json({ url: accountLink.url });
  } catch (err) {
    next(err);
  }
});

router.post('/verify-session', async (req, res, next) => {
  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        const booking = await getBookingDetailsById(bookingId);
        res.json(booking);
      } else {
        res.status(404).json({ error: 'Booking not found in session metadata' });
      }
    } else {
      res.status(400).json({ error: 'Payment not successful' });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
