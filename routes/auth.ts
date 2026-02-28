import { Router } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { keysToCamel } from '../dputils.js';
import { validate } from '../middleware/validation.js';
// I am now importing the correct AuthRequest type.
import { protect, AuthRequest } from '../middleware/auth.js';
import { config, isProduction } from '../config.js';

const router = Router();

router.post('/login', 
  body('email').isEmail().normalizeEmail(),
  body('password').not().isEmpty(),
  validate,
  async (req, res, next) => {
    const { email, password } = req.body;
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT id, email, password_hash, role FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      console.log('Signing token with secret:', config.jwtSecret);
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: '1h' });

      res.cookie('token', token, { 
        httpOnly: true, 
        secure: isProduction, 
        sameSite: 'strict',
        maxAge: 3600000 // 1 hour
      });

      res.json(keysToCamel({ id: user.id, email: user.email, role: user.role }));

    } catch (err) {
      next(err);
    } finally {
      client.release();
    }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/me', protect, (req: AuthRequest, res) => {
    res.json(keysToCamel(req.user));
});

export default router;