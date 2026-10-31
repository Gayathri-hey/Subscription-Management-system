import { CorsOptions } from 'cors';
import { config } from './env';

const isOriginAllowed = (
  origin: string | undefined,
  allowedOrigins: string[]
): boolean => {
  // Allow requests with no origin (like mobile apps, curl, server-to-server)
  if (!origin) {
    return true;
  }

  // Exact match against configured origins
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Allow localhost during development or test
  if (config.NODE_ENV !== 'production') {
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (isLocalhost) {
      return true;
    }
  }

  return false;
};

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin, config.CORS_ALLOWED_ORIGINS)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: Origin ${origin} is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours preflight cache
  optionsSuccessStatus: 204,
};

