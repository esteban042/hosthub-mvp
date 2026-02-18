import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../../middleware/validation';
import { createUser } from '../../services/user.service';

const router = Router();

router.post('/', 
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  validate,
  async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const newUser = await createUser(email, password);
      res.status(201).json(newUser);
    } catch (err: any) {
      if (err.code === '23505') { 
        return res.status(409).json({ error: 'A user with this email already exists.' });
      }
      next(err);
    }
});

export default router;
