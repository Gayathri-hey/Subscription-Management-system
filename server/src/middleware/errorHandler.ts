import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import logger from '../utils/logger';
import { config } from '../config/env';
import { FieldError } from '../types';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: FieldError[];

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    errors?: FieldError[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', errors?: FieldError[]) {
    super(400, message, true, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(401, message, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden access') {
    super(403, message, true);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message, true);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(409, message, true);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors?: FieldError[]) {
    super(400, message, true, errors);
  }
}

// Alias ApiError to AppError for backwards compatibility
export const ApiError = AppError;

/**
 * Handle Mongoose CastError (e.g., invalid ObjectId)
 */
const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid value "${err.value}" for field "${err.path}".`;
  return new BadRequestError(message, [{ field: err.path, message }]);
};

/**
 * Handle Mongoose duplicate key error (code 11000)
 */
const handleDuplicateFieldsDB = (err: any): AppError => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue ? err.keyValue[field] : '';
  const message = `Duplicate value "${value}" for field "${field}". Please use another value.`;
  return new ConflictError(message);
};

/**
 * Handle Mongoose ValidationError
 */
const handleValidationErrorDB = (err: any): AppError => {
  const errors: FieldError[] = Object.values(err.errors || {}).map((item: any) => ({
    field: item.path,
    message: item.message,
  }));
  const message = 'Validation failed. Please verify the submitted data.';
  return new ValidationError(message, errors);
};

/**
 * Handle JWT invalid signature
 */
const handleJWTError = (): AppError => {
  return new UnauthorizedError('Invalid token. Please authenticate again.');
};

/**
 * Handle JWT expired token
 */
const handleJWTExpiredError = (): AppError => {
  return new UnauthorizedError('Token has expired. Please authenticate again.');
};

/**
 * Centralized Express Error Handling Middleware
 */
export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error: AppError;

  if (err instanceof AppError) {
    error = err;
  } else if (err.name === 'CastError') {
    error = handleCastErrorDB(err);
  } else if (err.code === 11000) {
    error = handleDuplicateFieldsDB(err);
  } else if (err.name === 'ValidationError') {
    error = handleValidationErrorDB(err);
  } else if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  } else if (err instanceof SyntaxError && 'body' in err) {
    error = new BadRequestError('Malformed JSON payload received');
  } else {
    // Unhandled or unexpected programmer error
    const statusCode = err.statusCode || 500;
    const message = config.NODE_ENV === 'production' ? 'Internal Server Error' : err.message || 'Internal Server Error';
    error = new AppError(statusCode, message, false);
  }

  const statusCode = error.statusCode || 500;
  const isDev = config.NODE_ENV === 'development';

  // Log error details
  if (statusCode >= 500) {
    logger.error(`[${statusCode}] [${req.method} ${req.originalUrl}] ${err.message}`, {
      stack: err.stack,
      body: req.body,
    });
  } else {
    logger.warn(`[${statusCode}] [${req.method} ${req.originalUrl}] ${error.message}`, {
      errors: error.errors,
    });
  }

  res.status(statusCode).json({
    success: false,
    message: error.message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(isDev && { stack: err.stack }),
  });
};
