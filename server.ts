
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer'; // Import nodemailer
import React from 'react'; // Import React for server-side rendering
import ReactDOMServer from 'react-dom/server'; // Import ReactDOMServer
import { BookingConfirmationTemplate, BookingCancellationTemplate, BookingRequestReceivedTemplate } from './components/EmailTemplates'; // Import email templates
import { Booking, Apartment, Host } from './types'; // Import types for explicit casting

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Supabase Postgres Connection String
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:wjIuo5Aiu6GN58T@db.dmldmpdflblwwoppbvkv.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS hosts (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE,
        name TEXT,
        bio TEXT,
        avatar TEXT,
        subscription_type TEXT NOT NULL DEFAULT 'basic',
        commission_rate INT NOT NULL DEFAULT 3,
        contact_email TEXT,
        physical_address TEXT,
        country TEXT,
        phone_number TEXT,
        notes TEXT,
        airbnb_calendar_link TEXT,
        premium_config JSONB,
        payment_instructions TEXT
      );
      CREATE TABLE IF NOT EXISTS apartments (
        id TEXT PRIMARY KEY,
        host_id TEXT REFERENCES hosts(id) ON DELETE CASCADE,
        title TEXT,
        description TEXT,
        city TEXT,
        address TEXT,
        capacity INT,
        bedrooms INT,
        bathrooms INT,
        price_per_night INT,
        price_overrides JSONB,
        amenities JSONB,
        photos JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        map_embed_url TEXT
      );
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        apartment_id TEXT REFERENCES apartments(id) ON DELETE CASCADE,
        guest_name TEXT, -- Added guest_name column
        guest_email TEXT,
        guest_phone TEXT,
        num_guests INT,
        start_date DATE,
        end_date DATE,
        status TEXT,
        total_price INT,
        is_deposit_paid BOOLEAN DEFAULT FALSE,
        guest_message TEXT,
        deposit_amount INT
      );
      CREATE TABLE IF NOT EXISTS blocked_dates (
        id TEXT PRIMARY KEY,
        apartment_id TEXT,
        date DATE,
        reason TEXT
      );
    `);
    console.log('Supabase Postgres Schema Verified');
  } catch (err) {
    console.error('Database Initialization Error:', err);
  } finally {
    client.release();
  }
};

initDb();

const tenantMiddleware = async (req: any, res: any, next: any) => {
  const hostHeader = req.headers.host || '';
  let subdomain = hostHeader.split('.')[0];
  
  if (subdomain === 'www') {
    const parts = hostHeader.split('.');
    if (parts.length > 2) subdomain = parts[1];
  } else if (subdomain === 'localhost' || /^\d/.test(subdomain)) {
     subdomain = 'alpine-getaways';
  }
  
  try {
    let hostResult = await pool.query('SELECT * FROM hosts WHERE slug = $1', [subdomain]);
    if (hostResult.rows.length === 0) {
      hostResult = await pool.query('SELECT * FROM hosts LIMIT 1');
    }
    if (hostResult.rows.length === 0) {
      return res.status(404).json({ error: 'No host configuration found.' });
    }
    req.tenant = hostResult.rows[0];
    next();
  } catch (error) {
    res.status(500).json({ error: 'Tenant lookup failed', details: error.message });
  }
};

app.get('/api/v1/landing', tenantMiddleware, async (req: any, res) => {
  const hostId = req.tenant.id;
  try {
    const apartments = await pool.query('SELECT * FROM apartments WHERE host_id = $1', [hostId]);
    const aptIds = apartments.rows.map(a => a.id);
    const bookings = aptIds.length > 0 
      ? await pool.query('SELECT * FROM bookings WHERE apartment_id = ANY($1)', [aptIds])
      : { rows: [] };
    const blocks = await pool.query('SELECT * FROM blocked_dates WHERE apartment_id = \'all\' OR apartment_id = ANY($1)', [aptIds.length > 0 ? aptIds : ['none']]);
    
    res.json({
      host: req.tenant,
      apartments: apartments.rows,
      bookings: bookings.rows,
      blockedDates: blocks.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch landing data' });
  }
});

// Brevo (Sendinblue) SMTP Transporter
const brevoTransporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // Use STARTTLS for port 587
  auth: {
    user: process.env.BREVO_SMTP_USER || 'a1c59900@smtp-brevo.com', // Use provided Brevo login
    pass: process.env.BREVO_SMTP_PASS || 'xsmtpsib-163b72085fda760d32c317c17ba1c7f786441ab49a21149c686fa346059427b5-2gKzXXnfd62TsMjF', // Use provided Brevo SMTP key
  },
});

app.post('/api/v1/send-email', async (req, res) => {
  // Explicitly cast req.body to the expected types for better type safety
  const { toEmail, subject, templateName, booking, apartment, host } = req.body as {
    toEmail: string;
    subject: string;
    templateName: string;
    booking: Booking;
    apartment: Apartment;
    host: Host;
  };

  console.log(`Received email request: Sending "${templateName}" to ${toEmail} for booking ${booking?.id}`);

  let htmlContent = '';
  try {
    switch (templateName) {
      case 'BookingRequestReceived':
        // Rewriting JSX to React.createElement to avoid JSX parsing issues in .ts file
        htmlContent = ReactDOMServer.renderToString(React.createElement(BookingRequestReceivedTemplate, { host: host, apartment: apartment, booking: booking }));
        break;
      case 'BookingConfirmation':
        // Rewriting JSX to React.createElement to avoid JSX parsing issues in .ts file
        htmlContent = ReactDOMServer.renderToString(React.createElement(BookingConfirmationTemplate, { host: host, apartment: apartment, booking: booking }));
        break;
      case 'BookingCancellation':
        // Rewriting JSX to React.createElement to avoid JSX parsing issues in .ts file
        htmlContent = ReactDOMServer.renderToString(React.createElement(BookingCancellationTemplate, { host: host, apartment: apartment, booking: booking }));
        break;
      default:
        console.error('Invalid email template specified:', templateName);
        return res.status(400).json({ error: 'Invalid email template specified.' });
    }

    if (!htmlContent) {
      console.error('Generated HTML content is empty for template:', templateName);
      return res.status(500).json({ error: 'Failed to generate email content.' });
    }
    console.log(`HTML Content Length for ${templateName}: ${htmlContent.length} characters`);


    await brevoTransporter.sendMail({
      from: `Wanderlust Stays <${brevoTransporter.options.auth.user}>`, // Sender email
      to: toEmail,
      subject: subject,
      html: htmlContent,
    });
    console.log(`Email sent successfully to ${toEmail} for template: ${templateName}`);
    res.status(200).json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error(`Failed to send email for template ${templateName} to ${toEmail}:`, error);
    if (error.responseCode) {
        console.error(`SMTP Error Code: ${error.responseCode}, Message: ${error.response}`);
    }
    res.status(500).json({ error: 'Failed to send email.', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Boutique Backend running on Supabase Postgres at port ${port}`);
});
