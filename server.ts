import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

import { config, isProduction } from './config';
import { pool } from './db';
import { nonceGenerator, securityHeaders, httpsRedirect, apiLimiter } from './middleware/security';
import authRoutes from './routes/auth';
import apiRoutes from './routes/api';

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
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    res.status(200).send('OK');
  } catch (err) {
    next(err);
  }
});

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

app.listen(config.port, '0.0.0.0', () => {
  console.log(`
  🚀 HostHub Unified Server active!
  ---------------------------------
  Port: ${config.port}
  Health Check: http://0.0.0.0:${config.port}/health
  API Base: http://0.0.0.0:${config.port}/api/v1
  Auth Base: http://0.0.0.0:${config.port}/auth
  Static Root: ${clientPath}
  ---------------------------------
  `);
});
