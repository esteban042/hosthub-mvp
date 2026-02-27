import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../../dputils.js';

const router = Router();

router.post('/:apartmentId', async (req: Request, res: Response, next: NextFunction) => {
  const { apartmentId } = req.params;
  try {
    const result = await query(
      'UPDATE apartments SET page_views = COALESCE(page_views, 0) + 1 WHERE id = $1 RETURNING page_views',
      [apartmentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Apartment not found' });
    }

    res.status(200).json({ message: 'Page view count updated', pageViews: result.rows[0].pageViews });
  } catch (error) {
    next(error);
  }
});

export default router;
