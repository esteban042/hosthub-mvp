
import { Router } from 'express';
import { body } from 'express-validator';
import { pool } from '../../db.js';
import { keysToCamel } from '../../dputils.js';
import { validate } from '../../middleware/validation.js';
import { protect, AuthRequest } from '../../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../../types.js';

const router = Router();

// Creates or updates a single blocked date.
router.post('/',
  protect,
  body('apartmentId').isString().notEmpty(),
  body('date').isISO8601(),
  body('source').isIn(['MANUAL']),
  validate,
  async (req: AuthRequest, res, next) => {
    const { apartmentId, date, source } = req.body;
    const client = await pool.connect();
    const isAdmin = req.user?.role === UserRole.ADMIN;
    const userId = req.user?.id;

    try {
      // Authorization Check
      if (!isAdmin) {
        const hostRes = await client.query('SELECT id FROM hosts WHERE user_id = $1', [userId]);
        if (hostRes.rows.length === 0) {
          return res.status(403).json({ error: 'You must have a host profile to block dates.' });
        }
        const userHostId = hostRes.rows[0].id;

        const aptRes = await client.query('SELECT host_id FROM apartments WHERE id = $1', [apartmentId]);
        if (aptRes.rows.length === 0) {
          return res.status(404).json({ error: `Apartment not found.` });
        }
        if (String(aptRes.rows[0].host_id) !== String(userHostId)) {
          return res.status(403).json({ error: `You are not authorized to block dates for this apartment.` });
        }
      }

      await client.query('BEGIN');

      // Check if the date is already blocked
      const existingBlock = await client.query(
        'SELECT * FROM blocked_dates WHERE apartment_id = $1 AND date = $2',
        [apartmentId, date]
      );

      let result;
      if (existingBlock.rows.length > 0) {
        // If it exists, update the source. This handles cases like a manual block overriding an iCal block.
        const updateRes = await client.query(
          'UPDATE blocked_dates SET source = $1 WHERE id = $2 RETURNING *',
          [source, existingBlock.rows[0].id]
        );
        result = updateRes.rows[0];
      } else {
        // If it does not exist, insert a new blocked date.
        const newId = uuidv4();
        const insertRes = await client.query(
          'INSERT INTO blocked_dates (id, apartment_id, date, source) VALUES ($1, $2, $3, $4) RETURNING *',
          [newId, apartmentId, date, source]
        );
        result = insertRes.rows[0];
      }

      await client.query('COMMIT');
      res.status(201).json(keysToCamel(result));

    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  }
);

// Deletes a single blocked date by its unique ID.
router.delete('/',
  protect,
  body('id').isString().notEmpty(),
  validate,
  async (req: AuthRequest, res, next) => {
    const { id } = req.body;
    const client = await pool.connect();
    const isAdmin = req.user?.role === UserRole.ADMIN;
    const userId = req.user?.id;

    try {
      const blockedDateRes = await client.query('SELECT apartment_id, source FROM blocked_dates WHERE id = $1', [id]);
      if (blockedDateRes.rows.length === 0) {
        return res.status(200).json({ message: 'Blocked date not found or already deleted.' });
      }
      const { apartment_id, source } = blockedDateRes.rows[0];

      if (source === 'ICAL') {
        return res.status(400).json({ error: 'iCal-synced dates cannot be manually unblocked.' });
      }

      if (!isAdmin) {
        const hostRes = await client.query('SELECT id FROM hosts WHERE user_id = $1', [userId]);
        if (hostRes.rows.length === 0) {
          return res.status(403).json({ error: 'You must have a host profile to unblock dates.' });
        }
        const userHostId = hostRes.rows[0].id;

        const aptRes = await client.query('SELECT host_id FROM apartments WHERE id = $1', [apartment_id]);
        if (String(aptRes.rows[0].host_id) !== String(userHostId)) {
          return res.status(403).json({ error: `You are not authorized to unblock dates for this apartment.` });
        }
      }

      await client.query('DELETE FROM blocked_dates WHERE id = $1', [id]);
      res.status(200).json({ message: 'Blocked date deleted successfully' });

    } catch (err) {
      next(err);
    } finally {
      client.release();
    }
  }
);

export default router;
