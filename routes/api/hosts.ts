
import { Router } from 'express';
import { body } from 'express-validator';
import { pool, keysToCamel } from '../../db';
import { validate } from '../../middleware/validation';
import { protect, Request } from '../../middleware/auth';
import { SubscriptionType } from '../../types';

const router = Router();

router.get('/', 
  protect,
  async (req: Request, res, next) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to view this information.' });
    }
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM hosts');
      client.release();
      res.json(keysToCamel(result.rows));
    } catch (err) {
      next(err);
    }
});

router.get('/public', 
  async (req, res, next) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT slug, name FROM hosts');
      client.release();
      res.json(keysToCamel(result.rows));
    } catch (err) {
      next(err);
    }
});

router.post('/',
  protect,
  [
    body('name').not().isEmpty().trim().escape(),
    body('slug').not().isEmpty().trim().escape(),
    body('subscriptionType').isIn(Object.values(SubscriptionType)),
    body('commissionRate').isFloat({ gt: 0 }),
  ],
  validate,
  async (req: Request, res, next) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to create a host.' });
    }

    const {
        name,
        slug,
        bio = '',
        avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        subscriptionType = 'basic',
        commissionRate = 3,
        businessName = null,
        contactEmail = null,
        physicalAddress = null,
        country = null,
        phoneNumber = null,
        landingPagePicture = null,
        airbnbCalendarLink = null,
        paymentInstructions = null,
        premiumConfig = { isEnabled: false, images: [], sections: [] }
    } = req.body;

    const client = await pool.connect();
    try {
        const result = await client.query(
        `INSERT INTO hosts
            (name, slug, bio, avatar, subscription_type, commission_rate, business_name, contact_email, physical_address, country, phone_number, landing_page_picture, airbnb_calendar_link, premium_config, payment_instructions)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
            name,
            slug.toLowerCase().replace(/\s+/g, '-'),
            bio,
            avatar,
            subscriptionType,
            commissionRate,
            businessName,
            contactEmail,
            physicalAddress,
            country,
            phoneNumber,
            landingPagePicture,
            airbnbCalendarLink,
            JSON.stringify(premiumConfig),
            paymentInstructions
        ]
        );
        res.status(201).json(keysToCamel(result.rows[0]));
    } catch (err: any) {
        if (err.code === '23505' && err.constraint === 'hosts_slug_key') {
            return res.status(409).json({ error: 'This slug is already in use.' });
        }
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
    const updatedHosts = req.body;
    const client = await pool.connect();
    const isAdmin = req.user?.role === 'admin';
    const userId = req.user?.id;

    try {
      if (!isAdmin) {
        if (updatedHosts.length !== 1) {
          return res.status(403).json({ error: 'You are only authorized to update your own host profile.' });
        }
        const hostToUpdate = updatedHosts[0];
        const hostRes = await client.query('SELECT user_id FROM hosts WHERE id = $1', [hostToUpdate.id]);

        if (hostRes.rows.length === 0) {
          return res.status(404).json({ error: `Host with id ${hostToUpdate.id} not found.` });
        }

        const dbHost = hostRes.rows[0];
        if (String(dbHost.user_id) !== String(userId)) {
          return res.status(403).json({ error: 'You are not authorized to update this host.' });
        }
      }

      await client.query('BEGIN');

      for (const host of updatedHosts) {
        const {
          name, slug, bio, avatar, subscriptionType, commissionRate,
          businessName, contactEmail, physicalAddress, country, phoneNumber,
          landingPagePicture, airbnbCalendarLink, premiumConfig, paymentInstructions, id
        } = host;

        await client.query(
          `UPDATE hosts SET
            name = $1, slug = $2, bio = $3, avatar = $4, subscription_type = $5,
            commission_rate = $6, business_name = $7, contact_email = $8,
            physical_address = $9, country = $10, phone_number = $11,
            landing_page_picture = $12, airbnb_calendar_link = $13,
            premium_config = $14, payment_instructions = $15
          WHERE id = $16`,
          [
            name, slug, bio, avatar, subscriptionType, commissionRate,
            businessName, contactEmail, physicalAddress, country, phoneNumber,
            landingPagePicture, airbnbCalendarLink, premiumConfig, paymentInstructions, id
          ]
        );
      }

      await client.query('COMMIT');
      res.status(200).json({ message: 'Hosts updated successfully' });

    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
});

export default router;
