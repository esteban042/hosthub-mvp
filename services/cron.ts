import cron from 'node-cron';
import { getHosts } from './host.service.js';
// import { syncHostIcal } from './importer.service.js';

// Schedule a task to run every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  console.log('Running Airbnb calendar sync...');
  try {
    const hosts = await getHosts();
    for (const host of hosts) {
      if (host.airbnbCalendarLink) {
        console.log(`Syncing calendar for host: ${host.name}`);
        // await syncHostIcal(host.id, host.airbnbCalendarLink);
      }
    }
    console.log('Airbnb calendar sync complete.');
  } catch (error) {
    console.error('Error during Airbnb calendar sync:', error);
  }
});
