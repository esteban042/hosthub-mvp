import { Router, Request, Response, NextFunction, raw } from 'express';
import Stripe from 'stripe';
import { getBookingDetailsById, updateBookings, getBookingById } from '../../services/booking.service.js';
import { sendEmail } from '../../services/email.js';
import { Booking, BookingStatus, UserRole } from '../../types.js';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover' as any,
});

router.post('/', raw({ type: 'application/json' }), async (req: Request, res: Response, next: NextFunction) => {
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
          const originalBooking = await getBookingById(bookingId);
          if (originalBooking) {

            const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string, { expand: ['latest_charge'] });
            const charge = paymentIntent.latest_charge as Stripe.Charge;
            
            let stripeFee = 0;
            // Correctly retrieve the fee from the balance transaction
            if (charge && charge.balance_transaction) {
              const balanceTransaction = typeof charge.balance_transaction === 'string' ? await stripe.balanceTransactions.retrieve(charge.balance_transaction) : charge.balance_transaction;
              if(balanceTransaction) {
                stripeFee = balanceTransaction.fee / 100;
              }
            }
            
            const platformFee = originalBooking.totalPrice * (originalBooking.platformFee / originalBooking.totalPrice);
            const hostPayout = originalBooking.totalPrice - platformFee - stripeFee;

            const updatedBooking: Booking = {
              ...originalBooking,
              id: bookingId,
              status: BookingStatus.PAID,
              stripeFee,
              platformFee,
              hostPayout
            }
            await updateBookings([updatedBooking], {
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
                booking: updatedBooking,
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
