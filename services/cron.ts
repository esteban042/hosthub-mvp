import cron from 'node-cron';
import { apartmentService } from './apartment.service.js';
import { iCalService } from './ical.service.js';

cron.schedule('0 * * * *', async () => {
  console.log('Running hourly iCal sync...');

  try {
    const apartments = await apartmentService.findAll();

    for (const apartment of apartments) {
      if (apartment.icalUrls && apartment.icalUrls.length > 0) {
        console.log(`Syncing iCal for apartment: ${apartment.title}`);
        await iCalService.syncApartment(apartment.id, apartment.icalUrls);
      }
    }

    console.log('Hourly iCal sync finished.');
  } catch (error) {
    console.error('Error during hourly iCal sync:', error);
  }
});
