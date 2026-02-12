import { Router } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import { pool, keysToCamel } from '../../db';
import { validate } from '../../middleware/validation';

const router = Router();

router.post('/', 
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  validate,
  async (req, res, next) => {
    const { email, password } = req.body;
    const client = await pool.connect();
    try {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const result = await client.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role',
        [email, passwordHash]
      );

      const newUser = result.rows[0];
      res.status(201).json(keysToCamel(newUser));

    } catch (err: any) {
      if (err.code === '23505') { 
        return res.status(409).json({ error: 'A user with this email already exists.' });
      }
      next(err);
    } finally {
      client.release();
    }
});

export default router;
