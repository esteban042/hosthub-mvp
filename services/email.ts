import nodemailer from 'nodemailer';
import fs from 'fs';
import { config } from '../config.js';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  BookingConfirmationTemplate,
  BookingCancellationTemplate,
  DirectMessageTemplate,
  ServerCrashTemplate,
  CheckInMessageTemplate,
  WelcomeMessageTemplate,
  CheckoutMessageTemplate
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

  try {
    const TemplateComponent = {
      BookingConfirmation: BookingConfirmationTemplate,
      BookingCancellation: BookingCancellationTemplate,
      DirectMessage: DirectMessageTemplate,
      ServerCrash: ServerCrashTemplate,
      CheckInMessage: CheckInMessageTemplate,
      WelcomeMessage: WelcomeMessageTemplate,
      CheckoutMessage: CheckoutMessageTemplate,
    }[templateName];

    if (!TemplateComponent) {
      throw new Error(`Invalid email template: ${templateName}`);
    }

    const reactElement = React.createElement(TemplateComponent as React.FC<any>, data);
    htmlContent = ReactDOMServer.renderToStaticMarkup(reactElement);

    const smtpUser = config.brevo.smtpUser;
    const smtpPassword = getSmtpPassword();
    const senderEmail = config.brevo.senderEmail || smtpUser;

    // New diagnostic logging
    console.log('--- Email Service Diagnostics ---');
    console.log(`SMTP User Exists: ${!!smtpUser}, Length: ${smtpUser?.length || 0}`);
    console.log(`SMTP Password Exists: ${!!smtpPassword}, Length: ${smtpPassword?.length || 0}`);
    console.log('---------------------------------');

    if (!smtpUser || !smtpPassword) {
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
        user: smtpUser,
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
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('--- Fallback Email Details ---');
    console.error('To:', toEmail);
    console.error('Subject:', subject);
    console.error('Template:', templateName);
    console.error('Data:', data);
    throw new Error('Failed to send email');
  }
}
