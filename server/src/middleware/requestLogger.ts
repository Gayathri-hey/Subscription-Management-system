import morgan, { StreamOptions } from 'morgan';
import { Request } from 'express';
import logger from '../utils/logger';
import { config } from '../config/env';

// Stream morgan logs to winston logger
const stream: StreamOptions = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Define format string based on environment
morgan.token('real-ip', (req: Request) => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    '-'
  );
});

const devFormat = ':method :url :status :response-time ms - :res[content-length]';
const prodFormat =
  ':real-ip - [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" (:response-time ms)';

export const requestLogger = morgan(config.NODE_ENV === 'production' ? prodFormat : devFormat, {
  stream,
  skip: () => config.NODE_ENV === 'test',
});

