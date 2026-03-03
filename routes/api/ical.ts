import { Router } from 'express';
import { getBookingsByHostId } from '../../services/booking.service.js';
import { getApartmentsByHostId } from '../../services/apartment.service.js';

const router = Router();

router.get('/host/:hostId', async (req, res, next) => {
  try {
    const { hostId } = req.params;
    const bookings = await getBookingsByHostId(hostId);
    const apartments = await getApartmentsByHostId(hostId);

    let cal = 'BEGIN:VCALENDAR\n';
    cal += 'VERSION:2.0\n';
    cal += `PRODID:-//HostHub//NONSGML v1.0//EN\n`;

    for (const booking of bookings) {
      if (!booking.startDate || !booking.endDate) {
        continue; // Skip bookings without dates
      }

      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        continue; // Skip bookings with invalid dates
      }

      const formattedStartDate = startDate.toISOString().slice(0, 10).replace(/-/g, '');
      const formattedEndDate = endDate.toISOString().slice(0, 10).replace(/-/g, '');

      const apartment = apartments.find(a => a.id === booking.apartmentId);
      const apartmentTitle = apartment ? apartment.title : 'Unknown Apartment';

      cal += 'BEGIN:VEVENT\n';
      cal += `UID:${booking.id}@hosthub.com\n`;
      cal += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').substring(0, 15)}Z\n`;
      cal += `DTSTART;VALUE=DATE:${formattedStartDate}\n`;
      cal += `DTEND;VALUE=DATE:${formattedEndDate}\n`;
      cal += `SUMMARY:Booking at ${apartmentTitle} for ${booking.guestName}\n`;
      cal += `DESCRIPTION:Guest: ${booking.guestName} (${booking.guestEmail}). Guests: ${booking.numGuests}. Total: $${booking.totalPrice}\n`;
      cal += 'END:VEVENT\n';
    }

    cal += 'END:VCALENDAR';

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename=calendar.ics');
    res.send(cal);
  } catch (err) {
    next(err);
  }
});

export default router;
