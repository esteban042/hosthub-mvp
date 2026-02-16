
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
    body('vat').isFloat({ gte: 0 }).optional(),
    body('businessId').trim().escape().optional(),
    body('checkInTime').optional({ checkFalsy: true }).trim().escape(),
    body('checkOutTime').optional({ checkFalsy: true }).trim().escape(),
    body('checkInInfo').optional({ checkFalsy: true }).trim().escape(),
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
        premiumConfig = { isEnabled: false, images: [], sections: [] },
        vat = 0,
        businessId = null,
        checkInTime = null,
        checkOutTime = null,
        checkInInfo = null,
    } = req.body;

    const client = await pool.connect();
    try {
        const result = await client.query(
        `INSERT INTO hosts
            (name, slug, bio, avatar, subscription_type, commission_rate, business_name, contact_email, physical_address, country, phone_number, landing_page_picture, airbnb_calendar_link, premium_config, payment_instructions, vat, business_id, check_in_time, check_out_time, check_in_info)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
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
            paymentInstructions,
            vat,
            businessId,
            checkInTime,
            checkOutTime,
            checkInInfo,
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

router.put('/:hostId',
    protect,
    validate,
    async (req: Request, res, next) => {
        const { hostId } = req.params;
        const updatedHost = req.body;
        const client = await pool.connect();
        const isAdmin = req.user?.role === 'admin';
        const userId = req.user?.id;

        try {
            const hostRes = await client.query('SELECT user_id FROM hosts WHERE id = $1', [hostId]);

            if (hostRes.rows.length === 0) {
                return res.status(404).json({ error: `Host with id ${hostId} not found.` });
            }

            const dbHost = hostRes.rows[0];
            if (!isAdmin && String(dbHost.user_id) !== String(userId)) {
                return res.status(403).json({ error: 'You are not authorized to update this host.' });
            }

            const {
                name, slug, bio, avatar, subscriptionType, commissionRate,
                businessName, contactEmail, physicalAddress, country, phoneNumber,
                landingPagePicture, airbnbCalendarLink, premiumConfig, paymentInstructions, id,
                vat, businessId, checkInTime, checkOutTime, checkInInfo
            } = updatedHost;

            await client.query('BEGIN');

            const result = await client.query(
                `UPDATE hosts SET
                    name = $1, slug = $2, bio = $3, avatar = $4, subscription_type = $5,
                    commission_rate = $6, business_name = $7, contact_email = $8,
                    physical_address = $9, country = $10, phone_number = $11,
                    landing_page_picture = $12, airbnb_calendar_link =_calendar_link = $13,
                    premium_config = $14, payment_instructions = $15, vat = $16, business_id = $17,
                    check_in_time = $18, check_out_time = $19, check_in_info = $20
                WHERE id = $21
                RETURNING *`,
                [
                    name, slug, bio, avatar, subscriptionType, commissionRate,
                    businessName, contactEmail, physicalAddress, country, phoneNumber,
                    landingPagePicture, airbnbCalendarLink, premiumConfig, paymentInstructions,
                    vat, businessId, checkInTime, checkOutTime, checkInInfo, hostId
                ]
            );

            await client.query('COMMIT');
            res.status(200).json(keysToCamel(result.rows[0]));

        } catch (err) {
            await client.query('ROLLBACK');
            next(err);
        } finally {
            client.release();
        }
    });

export default router;
