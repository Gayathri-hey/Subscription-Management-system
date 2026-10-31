import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '../config/env';
import { ApiResponseHelper } from '../utils/apiResponse';

export const apiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    ApiResponseHelper.sendError(
      res,
      'Too many requests from this IP. Please try again later.',
      429,
      [{ message: `Rate limit of ${config.RATE_LIMIT_MAX} requests per ${Math.round(config.RATE_LIMIT_WINDOW_MS / 60000)} minutes exceeded.` }]
    );
  },
});

