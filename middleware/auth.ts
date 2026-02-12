
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { config } from '../config';
import { User } from '../types';

export interface Request extends Express.Request {
  user?: User;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.cookies.token) {
    try {
      token = req.cookies.token;

      const decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;

      const result = await pool.query('SELECT id, email, role FROM users WHERE id = $1', [decoded.id]);

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }

      req.user = result.rows[0];
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};
