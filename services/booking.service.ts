import { query, execute } from '../dputils';
import { sendEmail } from './email';
import { Booking, Apartment, Host, User, UserRole, BookingStatus } from '../types';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

/**
 * Fetches an apartment by its ID. Can lock the row for updates.
 */
async function getApartmentById(apartmentId: string, forUpdate: boolean = false): Promise<Apartment> {
    const sql = `SELECT * FROM apartments WHERE id = $1 ${forUpdate ? 'FOR UPDATE' : ''}`;
    const result = await query<Apartment>(sql, [apartmentId]);
    if (result.length === 0) {
        throw new Error('Apartment not found');
    }
    return result[0];
}

/**
 * Fetches a host by its ID.
 */
async function getHostById(hostId: string): Promise<Host> {
    const result = await query<Host>('SELECT * FROM hosts WHERE id = $1', [hostId]);
    if (result.length === 0) {
        throw new Error('Host not found');
    }
    return result[0];
}

/**
 * Fetches all bookings from the database. For admin use.
 */
export async function getAllBookings(): Promise<Booking[]> {
    return query<Booking>('SELECT * FROM bookings ORDER BY created_at DESC');
}

/**
 * Creates a new booking in a transaction.
 */
export async function createBooking(bookingData: Omit<Booking, 'id' | 'customBookingId' | 'totalPrice' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const {
        apartmentId, startDate, endDate, guestEmail, guestName, guestCountry, guestPhone, numGuests, guestMessage
    } = bookingData;
    
    await execute('BEGIN');
    
    try {
        const apartment = await getApartmentById(apartmentId, true);
        
        const nights = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
        if (nights < apartment.minStayNights) {
            throw new Error(`This property requires a minimum stay of ${apartment.minStayNights} nights.`);
        }
        
        const host = await getHostById(apartment.hostId);
        
        const bookingCountRes = await query<{ count: string }>('SELECT COUNT(b.id) FROM bookings b JOIN apartments a ON b.apartment_id = a.id WHERE a.host_id = $1', [host.id]);
        const bookingCount = parseInt(bookingCountRes[0].count, 10);
        
        const hostInitials = (host.name.match(/\b(\w)/g) || ['H', 'H']).join('').toUpperCase();
        const customBookingId = `${hostInitials}${String(bookingCount + 1).padStart(7, '0')}`;
        
        const overlappingBookingsRes = await query(
            `SELECT 1 FROM bookings WHERE apartment_id = $1 AND status != 'cancelled' AND (start_date, end_date) OVERLAPS ($2, $3)`,
            [apartmentId, startDate, endDate]
        );
        
        if (overlappingBookingsRes.length > 0) {
            throw new Error('The selected dates are not available');
        }
        
        const totalPrice = nights * apartment.pricePerNight;
        
        const status = host.stripeAccountId ? BookingStatus.PENDING_PAYMENT : BookingStatus.CONFIRMED;

        const bookingRes = await query<Booking>(
            `INSERT INTO bookings (apartment_id, start_date, end_date, total_price, status, guest_name, guest_email, guest_country, guest_phone, num_guests, guest_message, custom_booking_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [apartmentId, startDate, endDate, totalPrice, status, guestName, guestEmail, guestCountry, guestPhone, numGuests, guestMessage, customBookingId]
        );
        let newBooking = bookingRes[0];

        if (host.stripeAccountId) {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Booking for ${apartment.title}`,
                        },
                        unit_amount: totalPrice * 100,
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${process.env.APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.APP_URL}/booking/cancel?booking_id=${newBooking.id}`,
                metadata: {
                    bookingId: newBooking.id,
                },
            });
            newBooking.stripeSessionId = session.id;
            newBooking.stripeSessionUrl = session.url;
        }
        
        await execute('COMMIT');
        
        if (newBooking.status === BookingStatus.CONFIRMED) {
          try {
              await sendEmail(
                  newBooking.guestEmail,
                  'Your Booking Confirmation',
                  'BookingConfirmation',
                  { booking: newBooking, apartment, host }
              );
          } catch (emailError) {
              console.error('Failed to send confirmation email:', emailError);
          }
        }
        
        return newBooking;
        
    } catch (error) {
        await execute('ROLLBACK');
        throw error;
    }
}

/**
 * Fetches detailed information for a single booking.
 */
export async function getBookingDetailsById(bookingId: string): Promise<any | null> {
    const result = await query<any>(
        `SELECT
          b.*,
          a.title AS apartment_title,
          a.city AS apartment_city,
          a.photos AS apartment_photos,
          a.price_per_night,
          h.name AS host_name,
          h.contact_email AS host_email,
          h.phone_number AS host_phone,
          u.id AS host_user_id
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
        [bookingId]
    );

    return result.length > 0 ? result[0] : null;
}

/**
 * Updates a batch of bookings in a transaction.
 */
export async function updateBookings(updatedBookings: Booking[], user: User): Promise<Booking[]> {
    await execute('BEGIN');
    try {
        const resultBookings: Booking[] = [];
        let userHostId: string | null = null;

        if (user.role !== UserRole.Admin) {
            const hostRes = await query<{ id: string }>('SELECT id FROM hosts WHERE user_id = $1', [user.id]);
            if (hostRes.length === 0) {
                throw new Error('You do not have a host profile and cannot update bookings.');
            }
            userHostId = hostRes[0].id;
        }

        for (const booking of updatedBookings) {
            const {
                guestName, guestEmail, guestCountry, numGuests, startDate, endDate, totalPrice, status, id
            } = booking;

            const originalBookingRes = await query<Booking>('SELECT * FROM bookings WHERE id = $1 FOR UPDATE', [id]);
            if (originalBookingRes.length === 0) {
                throw new Error(`Booking with id ${id} not found.`);
            }
            const originalBooking = originalBookingRes[0];

            if (user.role !== UserRole.Admin) {
                const aptRes = await query<{ hostId: string }>('SELECT host_id FROM apartments WHERE id = $1', [originalBooking.apartmentId]);
                if (aptRes.length === 0 || String(aptRes[0].hostId) !== String(userHostId)) {
                    throw new Error(`You are not authorized to update booking with id ${id}.`);
                }
            }

            const updateRes = await query<Booking>(
                `UPDATE bookings SET
                  guest_name = $1, guest_email = $2, guest_country = $3, num_guests = $4,
                  start_date = $5, end_date = $6, total_price = $7, status = $8
                WHERE id = $9 RETURNING *`,
                [guestName, guestEmail, guestCountry, numGuests, startDate, endDate, totalPrice, status, id]
            );
            const updatedBooking = updateRes[0];
            resultBookings.push(updatedBooking);

            if (updatedBooking.status === 'canceled' && originalBooking.status !== 'canceled') {
                const apartment = await getApartmentById(originalBooking.apartmentId);
                const host = await getHostById(apartment.hostId);

                try {
                    await sendEmail(
                        updatedBooking.guestEmail,
                        `Your Booking for ${apartment.title} has been Canceled`,
                        'BookingCancellation',
                        { booking: updatedBooking, apartment, host }
                    );
                } catch (emailError) {
                    console.error(`Failed to send cancellation email for booking ${id}:`, emailError);
                }
            }
        }

        await execute('COMMIT');
        return resultBookings;
    } catch (error) {
        await execute('ROLLBACK');
        throw error;
    }
}
