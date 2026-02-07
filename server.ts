import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import path from 'path';
import { fileURLToPath } from 'url';
import { BookingConfirmationTemplate, BookingCancellationTemplate, BookingRequestReceivedTemplate } from './components/EmailTemplates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = process.cwd();

dotenv.config();

const app = express();
// Cloud Run injects the PORT environment variable automatically
const port = parseInt(process.env.PORT || '8080', 10);

app.use(cors() as any);
app.use(express.json() as any);

// Health check endpoint for Cloud Run/Kubernetes liveness probes
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// API: Send Email
app.post('/api/v1/send-email', async (req, res) => {
  const { toEmail, subject, templateName, booking, apartment, host } = req.body;

  try {
    let htmlContent = '';
    // Use React to render the email template to a string
    if (templateName === 'BookingConfirmation') {
      htmlContent = ReactDOMServer.renderToString(React.createElement(BookingConfirmationTemplate, { host, apartment, booking }));
    } else if (templateName === 'BookingCancellation') {
      htmlContent = ReactDOMServer.renderToString(React.createElement(BookingCancellationTemplate, { host, apartment, booking }));
    } else if (templateName === 'BookingRequestReceived') {
      htmlContent = ReactDOMServer.renderToString(React.createElement(BookingRequestReceivedTemplate, { host, apartment, booking }));
    }

    if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASS) {
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
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"HostHub Luxury Stays" <${process.env.BREVO_SMTP_USER}>`,
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

// Serve the static frontend files from the root directory
app.use(express.static(rootPath) as any);

// Fallback: Send index.html for any non-API routes (SPA support)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(rootPath, 'index.html'));
});

// Listen on 0.0.0.0 for Cloud Run compatibility
app.listen(port, '0.0.0.0', () => {
  console.log(`
  🚀 HostHub Unified Server active!
  ---------------------------------
  Port: ${port}
  Health Check: http://0.0.0.0:${port}/health
  API Base: http://0.0.0.0:${port}/api/v1
  Static Root: ${rootPath}
  ---------------------------------
  `);
});
