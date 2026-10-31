import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from './errorHandler';
import { FieldError } from '../types';

export const validateBody = (schema: ZodSchema<any>): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error instanceof ZodError || error?.issues) {
        const issues: any[] = error.issues || error.errors || [];
        const fieldErrors: FieldError[] = issues.map((err: any) => ({
          field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
          message: err.message,
        }));
        return next(new ValidationError('Validation failed', fieldErrors));
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodSchema<any>): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error: any) {
      if (error instanceof ZodError || error?.issues) {
        const issues: any[] = error.issues || error.errors || [];
        const fieldErrors: FieldError[] = issues.map((err: any) => ({
          field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
          message: err.message,
        }));
        return next(new ValidationError('Query validation failed', fieldErrors));
      }
      next(error);
    }
  };
};
