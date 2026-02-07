
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; // For local testing of environment variables
import nodemailer from 'nodemailer';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { BookingConfirmationTemplate, BookingCancellationTemplate, BookingRequestReceivedTemplate } from '../../components/EmailTemplates'; // Adjusted path
import { Booking, Apartment, Host } from '../../types'; // Adjusted path

// Firebase Functions specific imports
import * as functions from 'firebase-functions';

// Load environment variables for local testing only
// In Google Cloud Functions, these are set directly in the deployment environment
// dotenv.config(); // Removed: not needed for deployed functions

const app = express();
// Enable CORS for all origins (you might want to restrict this in production)
app.use(cors({ origin: true }));
// Cloud Functions automatically handle JSON body parsing, so no need for express.json() here.
// app.use(express.json()); // Removed: not needed for deployed functions

// Brevo (Sendinblue) SMTP Transporter
const brevoTransporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // Use STARTTLS for port 587
  auth: {
    user: process.env.BREVO_SMTP_USER, // These will be set as Firebase Functions environment variables
    pass: process.env.BREVO_SMTP_PASS, // These will be set as Firebase Functions environment variables
  },
});

app.post('/api/v1/send-email', async (req, res) => {
  const { toEmail, subject, templateName, booking, apartment, host } = req.body as {
    toEmail: string;
    subject: string;
    templateName: string;
    booking: Booking;
    apartment: Apartment;
    host: Host;
  };

  functions.logger.info(`Received email request: Sending "${templateName}" to ${toEmail} for booking ${booking?.id}`);

  let htmlContent = '';
  try {
    switch (templateName) {
      case 'BookingRequestReceived':
        htmlContent = ReactDOMServer.renderToString(React.createElement(BookingRequestReceivedTemplate, { host: host, apartment: apartment, booking: booking }));
        break;
      case 'BookingConfirmation':
        htmlContent = ReactDOMServer.renderToString(React.createElement(BookingConfirmationTemplate, { host: host, apartment: apartment, booking: booking }));
        break;
      case 'BookingCancellation':
        htmlContent = ReactDOMServer.renderToString(React.createElement(BookingCancellationTemplate, { host: host, apartment: apartment, booking: booking }));
        break;
      default:
        functions.logger.error('Invalid email template specified:', templateName);
        return res.status(400).json({ error: 'Invalid email template specified.' });
    }

    if (!htmlContent) {
      functions.logger.error('Generated HTML content is empty for template:', templateName);
      return res.status(500).json({ error: 'Failed to generate email content.' });
    }
    functions.logger.info(`HTML Content Length for ${templateName}: ${htmlContent.length} characters`);

    // Ensure Brevo SMTP credentials are set in the Firebase Function environment
    if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASS) {
      functions.logger.error('Brevo SMTP credentials are not set in environment variables.');
      return res.status(500).json({ error: 'Email service credentials missing. Please configure BREVO_SMTP_USER and BREVO_SMTP_PASS in Firebase Functions environment variables.' });
    }

    await brevoTransporter.sendMail({
      from: `Wanderlust Stays <${process.env.BREVO_SMTP_USER}>`, // Sender email
      to: toEmail,
      subject: subject,
      html: htmlContent,
    });
    functions.logger.info(`Email sent successfully to ${toEmail} for template: ${templateName}`);
    res.status(200).json({ message: 'Email sent successfully.' });
  } catch (error: any) {
    functions.logger.error(`Failed to send email for template ${templateName} to ${toEmail}:`, error);
    if (error.responseCode) {
        functions.logger.error(`SMTP Error Code: ${error.responseCode}, Message: ${error.response}`);
    }
    res.status(500).json({ error: 'Failed to send email.', details: error.message });
  }
});

// Export the Express app as an HTTPS Cloud Function
export const emailSender = functions.https.onRequest(app);
