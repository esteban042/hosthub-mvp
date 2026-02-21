import { Router, Request, Response, NextFunction, raw } from 'express';
import Stripe from 'stripe';
import { getBookingDetailsById, updateBookings, getBookingById } from '../../services/booking.service.js';
import { sendEmail } from '../../services/email.js';
import { BookingStatus, UserRole } from '../../types.js';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // @ts-expect-error The Stripe types for this property appear to be incorrect.
    apiVersion: '2023-10-16',
});

interface RequestWithRawBody extends Request {
    rawBody: Buffer;
}

router.post('/', raw({ type: 'application/json' }), async (req: Request, res: Response, next: NextFunction) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent((req as RequestWithRawBody).rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
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
          const originalBooking = await getBookingById(bookingId);
          if (originalBooking) {
            await updateBookings([{ ...originalBooking, id: bookingId, status: BookingStatus.PAID }], {
              id: bookingDetails.hostUserId,
              role: UserRole.HOST,
              email: bookingDetails.host_email,
              name: bookingDetails.host_name,
              avatar: ''
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
        }
      } catch (err) {
        return next(err);
      }
    }
  }

  res.json({ received: true });
});

export default router;
