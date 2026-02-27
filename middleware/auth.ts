import { Request as ExpressRequest, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { config } from '../config.js';
import { User } from '../types.js';
import { keysToCamel } from '../dputils.js';

export interface AuthRequest extends ExpressRequest {
  user?: User;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
    
    // Fetch all user data
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Not authorized, user not found' });
    }

    req.user = keysToCamel(result.rows[0]);
    next();
  } catch (err) {
    console.error('Token verification or user fetch failed:', err);
    return res.status(401).json({ error: 'Not authorized, token failed' });
  }
};
