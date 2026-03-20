import cron from 'node-cron';
import { apartmentService } from './apartment.service.js';
import { syncApartmentIcal } from './sync.service.js';

cron.schedule('*/10 * * * *', async () => {
  console.log('Running hourly iCal sync...');

  try {
    // 1. Fetch all apartments that have iCal URLs
    const apartments = await apartmentService.findAll();
    const apartmentsWithIcal = apartments.filter(apt => apt.icalUrls && apt.icalUrls.length > 0);

    console.log(`Found ${apartmentsWithIcal.length} apartments with iCal URLs to sync.`);

    // 2. Loop through and sync each one
    for (const apartment of apartmentsWithIcal) {
      // This check ensures that icalUrls is not undefined, satisfying TypeScript
      if (apartment.icalUrls) {
        console.log(`Syncing iCal for apartment: ${apartment.title} (ID: ${apartment.id})`);
        try {
          // Extract just the URLs before passing to the sync function
          const urls = apartment.icalUrls.map(ical => ical.url);
          // Use the new, correct sync service
          await syncApartmentIcal(apartment.id, urls);
          console.log(`Successfully synced iCal for apartment: ${apartment.title}`);
        } catch (syncError) {
          // Log the specific error for this apartment but continue with the next one
          console.error(`Error syncing iCal for apartment ${apartment.id}:`, syncError);
        }
      }
    }

    console.log('Hourly iCal sync finished.');
  } catch (error) {
    // This will catch errors from `apartmentService.findAll()`
    console.error('A critical error occurred during the hourly iCal sync process:', error);
  }
});
