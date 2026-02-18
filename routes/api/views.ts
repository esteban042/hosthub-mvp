import express from 'express';
import { execute } from '../../dputils';

const router = express.Router();

router.post('/:apartmentId', async (req, res, next) => {
  const { apartmentId } = req.params;
  try {
    const result = await execute(
      'UPDATE apartments SET page_views = COALESCE(page_views, 0) + 1 WHERE id = $1',
      [apartmentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Apartment not found' });
    }

    res.status(200).json({ message: 'Page view count updated' });
  } catch (error) {
    next(error);
  }
});

export default router;
