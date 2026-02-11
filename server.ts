import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult, query, param } from 'express-validator';
import { Pool } from 'pg';
import nodemailer from 'nodemailer';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import path from 'path';
import fs from 'fs';
import { BookingConfirmationTemplate, BookingCancellationTemplate } from './components/EmailTemplates.js';
import crypto from 'crypto';

const rootPath = process.cwd();
const clientPath = path.join(rootPath, 'dist');

const app = express();
const port = parseInt(process.env.PORT || '8081', 10);
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  // 'https://your-production-domain.com'
];

// const corsOptions = {
//   origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   optionsSuccessStatus: 200
// };


// app.use(express.json());

app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('hex');
  next();
});

app.use((req, res, next) => {
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
});

app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https' && isProduction) {
    return res.redirect([`https://${req.get('Host')}${req.url}`].join(''));
  }
  next();
});

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.get('/health', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    res.status(200).send('OK');
  } catch (err) {
    next(err);
  }
});

function getSmtpPassword() {
  const passwordPath = process.env.BREVO_SMTP_PASS;
  if (passwordPath && fs.existsSync(passwordPath)) {
    return fs.readFileSync(passwordPath, 'utf8').trim();
  }
  return process.env.BREVO_SMTP_PASS;
}

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

app.post('/api/v1/apartments', 
  body('name').not().isEmpty().trim().escape(),
  body('description').not().isEmpty().trim().escape(),
  body('price').isFloat({ gt: 0 }),
  body('location').not().isEmpty().trim().escape(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    const client = await pool.connect();
    try {
      res.status(501).send('Not Implemented');
    } catch (err) {
      next(err);
    } finally {
      client.release();
    }
});

app.get('/api/v1/apartments/:id', 
  param('id').isInt(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    const client = await pool.connect();
    try {
      const { id } = req.params;
      const result = await client.query('SELECT * FROM apartments WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Apartment not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    } finally {
      client.release();
    }
});

app.post('/api/v1/bookings', 
  body('apartmentId').isInt(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    const client = await pool.connect();
    try {
      res.status(501).send('Not Implemented');
    } catch (err) {
      next(err);
    } finally {
      client.release();
    }
});

app.get('/api/v1/bookings/:id', 
  param('id').isInt(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    const client = await pool.connect();
    try {
      res.status(501).send('Not Implemented');
    } catch (err) {
      next(err);
    } finally {
      client.release();
    }
});

app.post('/api/v1/users', 
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    const client = await pool.connect();
    try {
      res.status(501).send('Not Implemented');
    } catch (err) {
      next(err);
    } finally {
      client.release();
    }
});

app.post('/api/v1/login', 
  body('email').isEmail().normalizeEmail(),
  body('password').not().isEmpty(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    const client = await pool.connect();
    try {
      res.status(501).send('Not Implemented');
    } catch (err) {
      next(err);
    } finally {
      client.release();
    }
});

app.post('/api/v1/send-email', 
  body('toEmail').isEmail().normalizeEmail(),
  body('subject').not().isEmpty().trim().escape(),
  body('templateName').isIn(['BookingConfirmation', 'BookingCancellation']),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    const { toEmail, subject, templateName, booking, apartment, host } = req.body;
    try {
      let htmlContent = '';
      if (templateName === 'BookingConfirmation') {
        htmlContent = ReactDOMServer.renderToString(React.createElement(BookingConfirmationTemplate, { host, apartment, booking }));
      } else if (templateName === 'BookingCancellation') {
        htmlContent = ReactDOMServer.renderToString(React.createElement(BookingCancellationTemplate, { host, apartment, booking }));
      }

      const smtpPassword = getSmtpPassword();
      const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.BREVO_SMTP_USER;

      if (!process.env.BREVO_SMTP_USER || !smtpPassword) {
        console.log('--- EMAIL SIMULATION ---');
        console.log('To:', toEmail);
        console.log('Subject:', subject);
        return res.status(200).json({ message: 'Email simulated successfully (missing SMTP credentials)' });
      }

      const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        auth: {
          user: process.env.BREVO_SMTP_USER,
          pass: smtpPassword,
        },
      });

      await transporter.sendMail({
        from: `"HostHub Luxury Stays" <${senderEmail}>`,
        to: toEmail,
        subject: subject,
        html: htmlContent,
      });

      res.status(200).json({ message: 'Email sent successfully via SMTP' });
    } catch (error) {
      next(error);
    }
});

app.use(express.static(clientPath, { index: false }));

app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  const nonce = res.locals.nonce;
  fs.readFile(path.join(clientPath, 'index.html'), 'utf8', (err, data) => {
    if (err) {
      return next(err);
    }
    data = data.replace(/<script/g, `<script nonce="${nonce}"`);
    res.send(data);
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  if (isProduction) {
    res.status(500).json({ error: 'Something went wrong!' });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`
  🚀 HostHub Unified Server active!
  ---------------------------------
  Port: ${port}
  Health Check: http://0.0.0.0:${port}/health
  API Base: http://0.0.0.0:${port}/api/v1
  Static Root: ${clientPath}
  ---------------------------------
  `);
});
