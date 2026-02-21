import { Router } from 'express';
import Stripe from 'stripe';
import { getBookingDetailsById, updateBookings, getBookingById } from '../../services/booking.service';
import { sendEmail } from '../../services/email';
import { BookingStatus } from '../../types';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

router.post('/', async (req, res, next) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      try {
        const bookingDetails = await getBookingDetailsById(bookingId);
        if (bookingDetails) {
          const originalBooking = await getBookingById(bookingId, {
            id: bookingDetails.hostUserId,
            role: 'host',
          });
          await updateBookings([{ ...originalBooking, status: BookingStatus.PAID }], {
            id: bookingDetails.hostUserId,
            role: 'host',
          });

          await sendEmail(
            bookingDetails.guestEmail,
            'Your Booking Confirmation',
            'BookingConfirmation',
            {
              booking: bookingDetails,
              apartment: { title: bookingDetails.apartment_title },
              host: { name: bookingDetails.host_name },
            }
          );
        }
      } catch (err) {
        return next(err);
      }
    }
  }

  res.json({ received: true });
});

export default router;
