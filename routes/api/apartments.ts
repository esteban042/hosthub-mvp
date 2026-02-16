import { Router } from 'express';
import { body, param } from 'express-validator';
import { pool, keysToCamel } from '../../db';
import { validate } from '../../middleware/validation';
import { protect, Request } from '../../middleware/auth';

const router = Router();

// Route for admins to get all apartments
router.get('/', protect, async (req: Request, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'You are not authorized to view this information.' });
  }
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM apartments');
    client.release();
    res.json(keysToCamel(result.rows));
  } catch (err) {
    next(err);
  }
});

router.post('/',
  protect,
  [
    body('title').not().isEmpty().trim().escape(),
    body('description').not().isEmpty().trim().escape(),
    body('pricePerNight').isFloat({ gt: 0 }),
    body('address').not().isEmpty().trim().escape(),
    body('city').not().isEmpty().trim().escape(),
    body('capacity').isInt({ gt: 0 }),
    body('bedrooms').isInt({ gt: 0 }),
    body('bathrooms').isFloat({ gt: 0 }),
    body('minStayNights').isInt({ gt: 0 }),
    body('maxStayNights').isInt({ gt: 0 }),
  ],
  validate,
  async (req: Request, res, next) => {
    const {
      title,
      description,
      address,
      city,
      capacity,
      bedrooms,
      bathrooms,
      pricePerNight,
      priceOverrides = [],
      amenities = [],
      photos = [],
      isActive = true,
      mapEmbedUrl = null,
      minStayNights = 1,
      maxStayNights = 30,
    } = req.body;
    
    const client = await pool.connect();
    try {
      const hostRes = await client.query('SELECT id FROM hosts WHERE user_id = $1', [req.user!.id]);
      if (hostRes.rows.length === 0) {
        return res.status(403).json({ error: 'You do not have a host profile and cannot create apartments.' });
      }
      const hostId = hostRes.rows[0].id;

      const result = await client.query(
        `INSERT INTO apartments
          (host_id, title, description, address, city, capacity, bedrooms, bathrooms, price_per_night, price_overrides, amenities, photos, is_active, map_embed_url, min_stay_nights, max_stay_nights)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          hostId,
          title,
          description,
          address,
          city,
          capacity,
          bedrooms,
          bathrooms,
          pricePerNight,
          JSON.stringify(priceOverrides),
          JSON.stringify(amenities),
          JSON.stringify(photos),
          isActive,
          mapEmbedUrl,
          minStayNights,
          maxStayNights,
        ]
      );

      res.status(201).json(keysToCamel(result.rows[0]));
    } catch (err) {
      next(err);
    } finally {
      client.release();
    }
  });

router.put('/',
  protect,
  body().isArray(),
  validate,
  async (req: Request, res, next) => {
    const updatedApartments = req.body;
    const client = await pool.connect();
    const isAdmin = req.user?.role === 'admin';
    const userId = req.user?.id;

    try {
      if (!isAdmin) {
        const hostRes = await client.query('SELECT id FROM hosts WHERE user_id = $1', [userId]);
        if (hostRes.rows.length === 0) {
          return res.status(403).json({ error: 'You do not have a host profile and cannot update apartments.' });
        }
        const userHostId = hostRes.rows[0].id;

        for (const apt of updatedApartments) {
          const aptRes = await client.query('SELECT host_id FROM apartments WHERE id = $1', [apt.id]);
          if (aptRes.rows.length === 0) {
             return res.status(404).json({ error: `Apartment with id ${apt.id} not found.` });
          }
          if (String(aptRes.rows[0].host_id) !== String(userHostId)) {
             return res.status(403).json({ error: `You are not authorized to update apartment with id ${apt.id}.` });
          }
        }
      }

      await client.query('BEGIN');

      for (const apt of updatedApartments) {
        const {
            hostId, title, description, address, city, capacity,
            bedrooms, bathrooms, pricePerNight, priceOverrides,
            amenities, photos, isActive, mapEmbedUrl, minStayNights, maxStayNights, id
        } = apt;

        await client.query(
          `UPDATE apartments SET
            host_id = $1, title = $2, description = $3, address = $4, city = $5,
            capacity = $6, bedrooms = $7, bathrooms = $8, price_per_night = $9,
            price_overrides = $10, amenities = $11, photos = $12, is_active = $13,
            map_embed_url = $14, min_stay_nights = $15, max_stay_nights = $16
          WHERE id = $17`,
          [
            hostId, title, description, address, city, capacity,
            bedrooms, bathrooms, pricePerNight, 
            JSON.stringify(priceOverrides),
            JSON.stringify(amenities),
            JSON.stringify(photos),
            isActive, mapEmbedUrl, minStayNights, maxStayNights, id
          ]
        );
      }

      await client.query('COMMIT');
      res.status(200).json({ message: 'Apartments updated successfully' });

    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
});

router.get('/:id', 
  param('id').isString().notEmpty(),
  validate,
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      const { id } = req.params;
      const result = await client.query('SELECT * FROM apartments WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Apartment not found' });
      }
      res.json(keysToCamel(result.rows[0]));
    } catch (err) {
      next(err);
    } finally {
      client.release();
    }
});

export default router;
