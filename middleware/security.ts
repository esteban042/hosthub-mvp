import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { isProduction } from '../config';

export const nonceGenerator = (req: Request, res: Response, next: NextFunction) => {
  res.locals.nonce = crypto.randomBytes(16).toString('hex');
  next();
};

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': ['\'self\'', `\'nonce-${res.locals.nonce}\'`],
        'style-src': ['\'self\'', '\'unsafe-inline\'', 'https://fonts.googleapis.com'],
        'font-src': ['\'self\'', 'https://fonts.gstatic.com'],
        'connect-src': ['\'self\'', 'https://dmldmpdflblwwoppbvkv.supabase.co'],
        'img-src': ['\'self\'', 'data:', 'https://images.unsplash.com', 'https://api.dicebear.com'],
        'frame-src': ['\'self\'', 'https://*.supabase.co', 'https://www.google.com/'],
      },
    },
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true },
  })(req, res, next);
};

export const httpsRedirect = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers['x-forwarded-proto'] !== 'https' && isProduction) {
    return res.redirect([`https://${req.get('Host')}${req.url}`].join(''));
  }
  next();
};

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
