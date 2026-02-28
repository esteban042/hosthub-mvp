import { Router } from 'express';
import { importerService } from '../../services/importer.service.js';
import { protect, AuthRequest } from '../../middleware/auth.js';
import { UserRole, Host } from '../../types.js';
import { query } from '../../dputils.js';
import { QueryResult } from 'pg';

const router = Router();

router.post('/listing', protect, async (req: AuthRequest, res) => {
  if (req.user?.role !== UserRole.HOST) {
    return res.status(403).json({ message: 'Forbidden: Only hosts can import apartments.' });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  try {
    const hostResult: QueryResult<Host> = await query('SELECT * FROM hosts WHERE user_id = $1', [req.user.id]);
    if (hostResult.rows.length === 0) {
        return res.status(404).json({ message: 'Host profile not found for this user.' });
    }
    const host = hostResult.rows[0];
    const newApartment = await importerService.importApartment(url, host);
    res.status(201).json(newApartment);
  } catch (error) {
    if (error instanceof Error) {
        res.status(500).json({ message: error.message });
    } else {
        res.status(500).json({ message: 'An unknown error occurred during import.' });
    }
  }
});

export default router;
