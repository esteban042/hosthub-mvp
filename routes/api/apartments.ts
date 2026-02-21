import { Router, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../../middleware/validation.js';
import { protect, AuthRequest } from '../../middleware/auth.js';
import { 
    getAllApartments, 
    createApartment, 
    updateApartments, 
    getApartmentById 
} from '../../services/apartment.service.js';
import { UserRole } from '../../types.js';

const router = Router();

router.get('/', 
    protect, 
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (req.user?.role !== UserRole.ADMIN) {
            return res.status(403).json({ error: 'You are not authorized to view this information.' });
        }
        try {
            const apartments = await getAllApartments();
            res.json(apartments);
        } catch (err) {
            next(err);
        }
    }
);

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
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const newApartment = await createApartment(req.body, req.user!);
            res.status(201).json(newApartment);
        } catch (err: any) {
            if (err.message.includes('host profile')) {
                return res.status(403).json({ error: err.message });
            }
            next(err);
        }
    }
);

router.put('/',
    protect,
    body().isArray(),
    validate,
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        const updatedApartmentsData = req.body;
        try {
            await updateApartments(updatedApartmentsData, req.user!);
            res.status(200).json({ message: 'Apartments updated successfully' });
        } catch (err: any) {
            if (err.message.includes('not authorized') || err.message.includes('host profile')) {
                return res.status(403).json({ error: err.message });
            } else if (err.message.includes('not found')) {
                return res.status(404).json({ error: err.message });
            }
            next(err);
        }
    }
);

router.get('/:id', 
    param('id').isString().notEmpty(),
    validate,
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const apartment = await getApartmentById(id);
            if (!apartment) {
                return res.status(404).json({ error: 'Apartment not found' });
            }
            res.json(apartment);
        } catch (err) {
            next(err);
        }
    }
);

export default router;
