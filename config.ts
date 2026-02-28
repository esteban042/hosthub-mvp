const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

// Safely parse the JWT secret
let jwtSecret: string;
try {
  const secretFromEnv = getEnvVar('JWT_SECRET');
  const parsedSecret = JSON.parse(secretFromEnv);
  const secretKey = Object.keys(parsedSecret)[0];
  jwtSecret = parsedSecret[secretKey];
} catch (e) {
  jwtSecret = getEnvVar('JWT_SECRET');
}

if (!jwtSecret) {
  throw new Error('JWT_SECRET is not configured correctly');
}

export const config = {
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  port: parseInt(getEnvVar('PORT', '8081'), 10),
  jwtSecret: jwtSecret,
  databaseUrl: getEnvVar('DATABASE_URL'),
  adminEmail: getEnvVar('ADMIN_EMAIL'),
  supabaseUrl: getEnvVar('SUPABASE_URL', process.env.VITE_SUPABASE_URL),
  supabaseAnonKey: getEnvVar('SUPABASE_ANON_KEY', process.env.VITE_SUPABASE_ANON_KEY),
  // FIX: Make service key optional to prevent startup crash. Default to empty string.
  supabaseServiceKey: getEnvVar('SUPABASE_SERVICE_KEY', ''), 
  appUrl: getEnvVar('APP_URL', 'http://localhost:5173'),
  brevo: {
    smtpUser: getEnvVar('BREVO_SMTP_USER', ''),
    smtpPass: getEnvVar('BREVO_SMTP_PASS', ''),
    senderEmail: getEnvVar('BREVO_SENDER_EMAIL', ''),
  },
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:5173',
  ],
};

export const isProduction = config.nodeEnv === 'production';
