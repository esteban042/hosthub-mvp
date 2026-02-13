import nodemailer from 'nodemailer';
import fs from 'fs';
import { config } from '../config';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  BookingConfirmationTemplate,
  BookingCancellationTemplate,
} from '../components/EmailTemplates.js';

export function getSmtpPassword() {
  const passwordPath = config.brevo.smtpPass;
  if (passwordPath && fs.existsSync(passwordPath)) {
    return fs.readFileSync(passwordPath, 'utf8').trim();
  }
  return passwordPath;
}

export async function sendEmail(toEmail: string, subject: string, templateName: string, data: any) {
  let htmlContent = '';

  if (templateName === 'BookingConfirmation') {
    htmlContent = ReactDOMServer.renderToString(
      React.createElement(BookingConfirmationTemplate, data)
    );
  } else if (templateName === 'BookingCancellation') {
    htmlContent = ReactDOMServer.renderToString(
      React.createElement(BookingCancellationTemplate, data)
    );
  }

  const smtpPassword = getSmtpPassword();
  const senderEmail = config.brevo.senderEmail || config.brevo.smtpUser;

  if (!config.brevo.smtpUser || !smtpPassword) {
    console.log('--- EMAIL SIMULATION ---');
    console.log('To:', toEmail);
    console.log('Subject:', subject);
    console.log('Template:', templateName);
    console.log('Data:', data);
    console.log('(missing SMTP credentials)');
    return { message: 'Email simulated successfully' };
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
      user: config.brevo.smtpUser,
      pass: smtpPassword,
    },
  });

  await transporter.sendMail({
    from: `"Sanctum Stays" <${senderEmail}>`,
    to: toEmail,
    subject: subject,
    html: htmlContent,
  });

  return { message: 'Email sent successfully via SMTP' };
}
