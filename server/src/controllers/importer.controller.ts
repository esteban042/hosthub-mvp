import { Router } from 'express';
import { importerService } from '../services/importer.service';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../types';
import { hostService } from '../services/host.service';

const router = Router();

/**
 * @swagger
 * /api/import/airbnb:
 *   post:
 *     summary: Import an apartment from an Airbnb URL
 *     tags: [Importer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: The URL of the Airbnb listing to import.
 *     responses:
 *       201:
 *         description: The imported apartment was created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Apartment'
 *       400:
 *         description: Bad request, such as an invalid URL.
 *       401:
 *         description: Unauthorized, user is not a host.
 *       500:
 *         description: Internal server error during import.
 */
router.post('/airbnb', authMiddleware([UserRole.HOST]), async (req, res) => {
  const { url } = req.body;
  const userId = req.user?.id;

  if (!url || !userId) {
    return res.status(400).json({ message: 'URL and user ID are required' });
  }

  try {
    // A host is tied to a user. We need to fetch the host entity.
    const host = await hostService.findByUserId(userId);
    if (!host) {
      return res.status(404).json({ message: 'Host not found for the current user.' });
    }

    const newApartment = await importerService.importApartment(url, host);
    res.status(201).json(newApartment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
