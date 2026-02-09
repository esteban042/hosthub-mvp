import express, { Request, Response } from 'express';
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

const rootPath = process.cwd();
const clientPath = path.join(rootPath, 'dist');

const app = express();
const port = parseInt(process.env.PORT || '8081', 10);

app.use(cors());
app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': [''self'', ''unsafe-inline''],
        'connect-src': [''self'', 'https://dmldmpdflblwwoppbvkv.supabase.co'],
      },
    },
  })
);

// Enforce HTTPS in production
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  next();
});

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use('/api', apiLimiter);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

function getSmtpPassword() {
  const passwordPath = process.env.BREVO_SMTP_PASS;
  if (passwordPath && fs.existsSync(passwordPath)) {
    return fs.readFileSync(passwordPath, 'utf8').trim();
  }
  return process.env.BREVO_SMTP_PASS;
}

// Validation middleware for API endpoints
const validate = (req: Request, res: Response, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

//prettier-ignore
app.post('/api/v1/apartments', 
  body('name').not().isEmpty().trim().escape(),
  body('description').not().isEmpty().trim().escape(),
  body('price').isFloat({ gt: 0 }),
  body('location').not().isEmpty().trim().escape(),
  validate,
  async (req: Request, res: Response) => {
    res.status(501).send('Not Implemented');
});

//prettier-ignore
app.get('/api/v1/apartments/:id', 
  param('id').isInt(),
  validate,
  async (req: Request, res: Response) => {
    res.status(501).send('Not Implemented');
});

//prettier-ignore
app.post('/api/v1/bookings', 
  body('apartmentId').isInt(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  validate,
  async (req: Request, res: Response) => {
    res.status(501).send('Not Implemented');
});

//prettier-ignore
app.get('/api/v1/bookings/:id', 
  param('id').isInt(),
  validate,
  async (req: Request, res: Response) => {
    res.status(501).send('Not Implemented');
});

//prettier-ignore
app.post('/api/v1/users', 
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  validate,
  async (req: Request, res: Response) => {
    res.status(501).send('Not Implemented');
});

//prettier-ignore
app.post('/api/v1/login', 
  body('email').isEmail().normalizeEmail(),
  body('password').not().isEmpty(),
  validate,
  async (req: Request, res: Response) => {
    res.status(501).send('Not Implemented');
});

//prettier-ignore
app.post('/api/v1/send-email', 
  body('toEmail').isEmail().normalizeEmail(),
  body('subject').not().isEmpty().trim().escape(),
  body('templateName').isIn(['BookingConfirmation', 'BookingCancellation']),
  validate,
  async (req: Request, res: Response) => {

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
    } catch (error: any) {
      console.error('Email error:', error);
      res.status(500).json({ error: error.message });
    }
});

app.use(express.static(clientPath));


app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(clientPath, 'index.html'));
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
