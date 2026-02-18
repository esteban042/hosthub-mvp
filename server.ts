import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

import { config, isProduction } from './config';
import { query } from './dputils';
import { nonceGenerator, securityHeaders, httpsRedirect, apiLimiter } from './middleware/security';
import authRoutes from './routes/auth';
import apiRoutes from './routes/api';
import { sendEmail } from './services/email';

const rootPath = process.cwd();
const clientPath = path.join(rootPath, 'dist');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: config.allowedOrigins, credentials: true }));

app.use(nonceGenerator);
app.use(securityHeaders);
app.use(httpsRedirect);

app.get('/health', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await query('SELECT NOW()');
    res.status(200).send('OK');
  } catch (err) {
    next(err);
  }
});

// Add a test route to simulate a server crash
if (!isProduction) {
    app.get('/test-crash', (req, res, next) => {
        throw new Error('This is a test crash!');
    });
  }

// Register auth routes separately
app.use('/auth', authRoutes);

// All other API routes are under /api/v1 and have a rate limiter
app.use('/api/v1', apiLimiter, apiRoutes);

app.use(express.static(clientPath, { index: false }));

app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const nonce = res.locals.nonce;
  fs.readFile(path.join(clientPath, 'index.html'), 'utf8', (err, data) => {
    if (err) {
      return next(err);
    }
    data = data.replace(/<script/g, `<script nonce="${res.locals.nonce}"`);
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

// Global error handling for server crashes
const adminEmail = config.adminEmail;

process.on('uncaughtException', (error: Error) => {
  console.error('Unhandled Exception:', error);
  sendEmail(adminEmail, 'Server Crash Report', 'ServerCrash', { error })
    .then(() => process.exit(1))
    .catch(err => {
      console.error('Failed to send crash report email:', err);
      process.exit(1);
    });
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  const error = new Error(reason.stack || reason);
  sendEmail(adminEmail, 'Server Crash Report', 'ServerCrash', { error })
    .then(() => process.exit(1))
    .catch(err => {
      console.error('Failed to send crash report email:', err);
      process.exit(1);
    });
});

app.listen(config.port, '0.0.0.0', () => {
  console.log(`
  🚀 Sanctum Unified Server active!
  ---------------------------------
  Port: ${config.port}
  Health Check: http://0.0.0.0:${config.port}/health
  API Base: http://0.0.0.0:${config.port}/api/v1
  Auth Base: http://0.0.0.0:${config.port}/auth
  Static Root: ${clientPath}
  ---------------------------------
  `);
});
