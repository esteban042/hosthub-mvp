
import express from 'express';
import { apartmentService } from '../../services/apartment.service.js';
import { syncApartmentIcal } from '../../services/sync.service.js';
import { UserRole } from '../../types.js';

const router = express.Router();

// POST /api/v1/sync/:apartmentId
// Manually triggers an iCal sync for a single apartment.
router.post('/:apartmentId', async (req, res, next) => {
  // @ts-ignore
  const user = req.user;
  const { apartmentId } = req.params;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const apartment = await apartmentService.findById(apartmentId);

    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    // Authorization check: User must be the host of the apartment or an admin.
    if (user.role === UserRole.HOST) {
      // @ts-ignore
      if (!user.hostId || apartment.hostId.toString() !== user.hostId.toString()) {
        return res.status(403).json({ error: 'You are not authorized to sync this apartment.' });
      }
    }

    if (!apartment.icalUrls || apartment.icalUrls.length === 0) {
      return res.status(400).json({ error: 'No iCal URLs are configured for this apartment.' });
    }

    // Extract just the URLs before passing to the sync function
    const urls = apartment.icalUrls.map(ical => ical.url);

    // Trigger the sync
    await syncApartmentIcal(apartment.id, urls);

    res.status(200).json({ message: 'Sync completed successfully. Please refresh the calendar to see updates.' });
  } catch (error) {
    console.error(`Manual sync failed for apartment ${apartmentId}:`, error);
    res.status(500).json({ error: 'An unexpected error occurred during the sync process.' });
  }
});

export default router;
