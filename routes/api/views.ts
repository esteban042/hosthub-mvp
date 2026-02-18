import express from 'express';
import { pool } from '../../db';

const router = express.Router();

router.post('/:apartmentId', async (req, res, next) => {
  const { apartmentId } = req.params;
  const client = await pool.connect();
  try {
    const selectResult = await client.query('SELECT page_views FROM apartments WHERE id = $1', [apartmentId]);

    if (selectResult.rows.length === 0) {
      return res.status(404).json({ message: 'Apartment not found' });
    }

    const currentViews = selectResult.rows[0].page_views || 0;
    const newViews = currentViews + 1;

    await client.query('UPDATE apartments SET page_views = $1 WHERE id = $2', [newViews, apartmentId]);

    res.status(200).json({ message: 'Page view count updated' });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
});

export default router;
