
import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../../middleware/validation';
import { createBooking, addStripeSessionIdToBooking, updateBookingStatus } from '../../services/booking.service';
import { getApartmentById } from '../../services/apartment.service';
import { getHostById } from '../../services/host.service';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

const router = Router();

router.post(
  '/create-checkout-session',
  [
    body('apartmentId').isString(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('guestName').isString(),
    body('guestEmail').isEmail(),
    body('guestCountry').isString(),
    body('guestPhone').isString().optional(),
    body('numGuests').isInt({ min: 1 }),
    body('guestMessage').isString().optional(),
  ],
  validate,
  async (req, res) => {
    try {
      const {
        apartmentId,
        startDate,
        endDate,
        guestName,
        guestEmail,
        guestCountry,
        guestPhone,
        numGuests,
        guestMessage,
      } = req.body;

      const apartment = await getApartmentById(apartmentId);
      if (!apartment) {
        return res.status(404).json({ message: 'Apartment not found' });
      }

      const host = await getHostById(apartment.hostId);

      // Calculate total price
      const start = new Date(startDate);
      const end = new Date(endDate);
      let totalPrice = 0;
      let current = new Date(start);
      while (current.toISOString().split('T')[0] < end.toISOString().split('T')[0]) {
        const dateStr = current.toISOString().split('T')[0];
        const override = apartment.priceOverrides?.find(rule => dateStr >= rule.startDate && dateStr <= rule.endDate);
        totalPrice += override ? override.price : (apartment.pricePerNight || 0);
        current.setDate(current.getDate() + 1);
      }

      if (!host.stripeAccountId || !host.stripeActive) {
        // This host doesn't use Stripe, use the original booking flow
        const newBooking = await createBooking({
            apartmentId,
            startDate,
            endDate,
            guestEmail,
            guestName,
            guestCountry,
            guestPhone,
            numGuests,
            guestMessage,
        });
        return res.status(201).json({ booking: newBooking });
      }
      
      const depositPercentage = host.stripeDepositPercentage > 0 ? host.stripeDepositPercentage : 100;
      const depositAmount = (totalPrice * (depositPercentage / 100));

      // Create a booking with 'pending_payment' status
      const pendingBooking = await createBooking({
        apartmentId,
        startDate,
        endDate,
        guestEmail,
        guestName,
        guestCountry,
        guestPhone,
        numGuests,
        guestMessage,
        status: 'pending_payment'
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Deposit for ${apartment.name}`,
              },
              unit_amount: Math.round(depositAmount * 100), // amount in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/booking/canceled`,
        client_reference_id: pendingBooking.id, // Store booking ID
      });
      
      await addStripeSessionIdToBooking(pendingBooking.id, session.id);

      res.json({ sessionId: session.id, paymentUrl: session.url });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

router.post('/webhook', (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const bookingId = session.client_reference_id;
      updateBookingStatus(bookingId, 'paid');
    }
  
    res.json({ received: true });
});

export default router;
