import 'dotenv/config';

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const config = {
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  port: parseInt(getEnvVar('PORT', '8081'), 10),
  jwtSecret: getEnvVar('JWT_SECRET'),
  databaseUrl: getEnvVar('DATABASE_URL'),
  brevo: {
    smtpUser: getEnvVar('BREVO_SMTP_USER', ''),
    smtpPass: getEnvVar('BREVO_SMTP_PASS', ''),
    senderEmail: getEnvVar('BREVO_SENDER_EMAIL', ''),
  },
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:5173',
    // 'https://your-production-domain.com'
  ],
};

export const isProduction = config.nodeEnv === 'production';
