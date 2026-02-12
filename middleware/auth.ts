import { Request as ExpressRequest, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { pool } from '../db';

interface UserPayload {
  id: string;
  email: string;
  role: string;
}

export interface Request extends ExpressRequest {
  user?: UserPayload;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as UserPayload;
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT id, email, role FROM users WHERE id = $1', [decoded.id]);
      const user = result.rows[0];
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      req.user = user;
      next();
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
