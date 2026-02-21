import { Router, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { validate } from '../../middleware/validation.js';
import { protect, AuthRequest } from '../../middleware/auth.js';
import { SubscriptionType, UserRole } from '../../types.js';
import { 
  getHosts, 
  getPublicHosts, 
  createHost, 
  updateHost, 
  getHostById 
} from '../../services/host.service.js';

const router = Router();

router.get('/', 
  protect,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'You are not authorized to view this information.' });
    }
    try {
      const hosts = await getHosts();
      res.json(hosts);
    } catch (err) {
      next(err);
    }
});

router.get('/public', 
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const hosts = await getPublicHosts();
      res.json(hosts);
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
    body('vat').isFloat({ min: 0 }).optional(),
    body('businessId').trim().escape().optional(),
    body('checkInTime').optional({ checkFalsy: true }).trim().escape(),
    body('checkOutTime').optional({ checkFalsy: true }).trim().escape(),
    body('checkInInfo').optional({ checkFalsy: true }).trim().escape(),
    body('checkInMessage').optional({ checkFalsy: true }).trim().escape(),
    body('welcomeMessage').optional({ checkFalsy: true }).trim().escape(),
    body('checkoutMessage').optional({ checkFalsy: true }).trim().escape(),
    body('currency').optional({ checkFalsy: true }).trim().escape(),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'You are not authorized to create a host.' });
    }

    try {
      const newHost = await createHost({
        ...req.body,
        userId: req.user.id
      });
      res.status(201).json(newHost);
    } catch (err: any) {
        if (err.code === '23505' && err.constraint === 'hosts_slug_key') {
            return res.status(409).json({ error: 'This slug is already in use.' });
        }
        next(err);
    }
});

router.put('/:hostId', 
  protect, 
  validate, 
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { hostId } = req.params;
    const updatedFields = req.body;

    try {
      const host = await getHostById(hostId);
      if (!host) {
        return res.status(404).json({ error: `Host with id ${hostId} not found.` });
      }

      if (req.user?.role !== UserRole.ADMIN && String(host.userId) !== String(req.user?.id)) {
        const userRole = req.user?.role || 'undefined';
        return res.status(403).json({ error: `Authorization failed. Your role is '${userRole}'. You are not the owner of this host.` });
      }

      // Only admins can update the currency
      if (updatedFields.currency && req.user?.role !== UserRole.ADMIN) {
        return res.status(403).json({ error: 'You are not authorized to update the currency.' });
      }

      const updatedHost = await updateHost(hostId, updatedFields);
      res.status(200).json(updatedHost);
    } catch (err) {
      next(err);
    } 
});

export default router;
