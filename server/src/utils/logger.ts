import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { config } from '../config/env';

// Ensure logs directory exists
const logDirectory = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Human-readable format for development console
const devLogFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const isProduction = config.NODE_ENV === 'production';

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: isProduction
      ? combine(timestamp(), json())
      : combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), devLogFormat),
  }),
  new winston.transports.File({
    filename: path.join(logDirectory, 'error.log'),
    level: 'error',
    format: combine(timestamp(), errors({ stack: true }), json()),
  }),
  new winston.transports.File({
    filename: path.join(logDirectory, 'combined.log'),
    format: combine(timestamp(), errors({ stack: true }), json()),
  }),
];

const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  transports,
  exitOnError: false,
});

export default logger;
