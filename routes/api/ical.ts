import { Router } from 'express';
import { iCalService } from '../../services/ical.service.js';
import { apartmentService } from '../../services/apartment.service.js';

const router = Router();

router.post('/sync/:apartmentId', async (req, res) => {
  const { apartmentId } = req.params;

  try {
    const apartment = await apartmentService.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found.' });
    }

    if (!apartment.icalUrls) {
        return res.status(200).json({ message: 'No iCal URLs to sync.' });
    }

    await iCalService.syncApartment(apartment.id, apartment.icalUrls);
    res.status(200).json({ message: 'iCal sync successful.' });
  } catch (error) {
    let message = 'Unknown error';
    if (error instanceof Error) {
        message = error.message;
    }
    res.status(500).json({ message });
  }
});

export default router;
