import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Look for .env in current directory, parent (root), or server folder
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  CLIENT_URL: string;
  CORS_ALLOWED_ORIGINS: string[];
  MONGO_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  EMAIL_FROM: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
  DEFAULT_PAGE_SIZE: number;
  MAX_PAGE_SIZE: number;
}

const validateEnv = (): EnvConfig => {
  const errors: string[] = [];

  // NODE_ENV validation
  const rawNodeEnv = process.env.NODE_ENV || 'development';
  if (!['development', 'production', 'test'].includes(rawNodeEnv)) {
    errors.push(`NODE_ENV must be 'development', 'production', or 'test'. Received: "${rawNodeEnv}"`);
  }
  const NODE_ENV = rawNodeEnv as 'development' | 'production' | 'test';

  // PORT validation
  const rawPort = process.env.PORT || '5000';
  const PORT = parseInt(rawPort, 10);
  if (isNaN(PORT) || PORT <= 0 || PORT > 65535) {
    errors.push(`PORT must be a valid number between 1 and 65535. Received: "${rawPort}"`);
  }

  // CLIENT_URL validation
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
  try {
    new URL(CLIENT_URL);
  } catch {
    errors.push(`CLIENT_URL must be a valid URL string. Received: "${CLIENT_URL}"`);
  }

  // CORS Allowed Origins
  const corsOriginsRaw = process.env.CORS_ALLOWED_ORIGINS || CLIENT_URL;
  const CORS_ALLOWED_ORIGINS = corsOriginsRaw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  // MONGO_URI validation
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/subscription_management';
  if (!MONGO_URI.startsWith('mongodb://') && !MONGO_URI.startsWith('mongodb+srv://')) {
    errors.push(`MONGO_URI must start with "mongodb://" or "mongodb+srv://". Received: "${MONGO_URI}"`);
  }

  // JWT Secrets
  const defaultSecret = 'your-super-secret-jwt-key-change-in-production';
  const defaultRefresh = 'your-super-secret-refresh-key-change-in-production';

  const JWT_SECRET = process.env.JWT_SECRET || (NODE_ENV === 'production' ? '' : defaultSecret);
  if (!JWT_SECRET) {
    errors.push('JWT_SECRET is required and must not be empty.');
  } else if (NODE_ENV === 'production' && (JWT_SECRET === defaultSecret || JWT_SECRET.length < 32)) {
    errors.push('JWT_SECRET in production must be a secure key with at least 32 characters and not the default value.');
  }

  const JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || (NODE_ENV === 'production' ? '' : defaultRefresh);
  if (!JWT_REFRESH_SECRET) {
    errors.push('JWT_REFRESH_SECRET is required and must not be empty.');
  } else if (NODE_ENV === 'production' && (JWT_REFRESH_SECRET === defaultRefresh || JWT_REFRESH_SECRET.length < 32)) {
    errors.push('JWT_REFRESH_SECRET in production must be a secure key with at least 32 characters and not the default value.');
  }

  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  // SMTP validation
  const SMTP_HOST = process.env.SMTP_HOST || 'smtp.mailtrap.io';
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
  if (isNaN(SMTP_PORT)) {
    errors.push(`SMTP_PORT must be a valid number. Received: "${process.env.SMTP_PORT}"`);
  }
  const SMTP_USER = process.env.SMTP_USER || '';
  const SMTP_PASS = process.env.SMTP_PASS || '';
  const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@subscriptions.com';

  // Rate Limiter
  const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 mins
  const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);

  if (errors.length > 0) {
    const header = '══════════════════════════════════════════════════════════════';
    const errorMsg = [
      '',
      header,
      '  ❌ ENVIRONMENT VARIABLE VALIDATION ERROR(S):',
      header,
      ...errors.map((err, idx) => `  ${idx + 1}. ${err}`),
      header,
      '',
    ].join('\n');
    throw new Error(errorMsg);
  }

  return {
    NODE_ENV,
    PORT,
    CLIENT_URL,
    CORS_ALLOWED_ORIGINS,
    MONGO_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    EMAIL_FROM,
    RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX,
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  };
};

export const config = validateEnv();
export type Config = typeof config;
