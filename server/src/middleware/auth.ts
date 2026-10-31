import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyAccessToken } from '../utils/token';
import { User, IUserDocument } from '../models/user.model';
import { Customer } from '../models/customer.model';
import { UnauthorizedError, ForbiddenError } from './errorHandler';
import { UserRole } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
      customerId?: string;
    }
  }
}

/**
 * Authentication Middleware
 * Validates access token from Bearer header or HTTP-only cookie.
 */
export const authenticate: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // 1. Check Authorization Bearer header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Fallback to HTTP-only cookie
    if (!token && req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required. No session token provided.');
    }

    // 3. Verify JWT
    const payload = verifyAccessToken(token);

    // 4. Check user existence and account status in database
    const user = await User.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError('User account associated with this token no longer exists.');
    }

    if (user.status === 'suspended') {
      throw new ForbiddenError('Account has been suspended. Please contact support.');
    }

    if (user.status === 'inactive') {
      throw new ForbiddenError('Account is inactive. Please contact support.');
    }

    req.user = user;

    // If customer, pre-fetch their linked customer ID for isolation checks
    if (user.role === 'customer') {
      const customer = await Customer.findOne({ user: user._id }).select('_id');
      if (customer) {
        req.customerId = customer._id.toString();
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-Based Access Control Middleware
 */
export const authorize = (...allowedRoles: UserRole[]): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return next(
        new ForbiddenError(
          `Access forbidden: Requires ${allowedRoles.join(' or ')} privileges. Current role: ${req.user.role}`
        )
      );
    }

    next();
  };
};

/**
 * Customer Data Isolation Guard
 * Prevents customers from accessing other customers' data via URL params, query, or body.
 */
export const checkCustomerAccess = (
  paramKey: string = 'customerId'
): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // Admin and Staff can manage operational accounts
    if (req.user.role === 'admin' || req.user.role === 'staff') {
      return next();
    }

    // For customers, check against their linked customer ID
    if (req.user.role === 'customer') {
      const targetCustomerId =
        req.params[paramKey] ||
        (req.query[paramKey] as string) ||
        (req.body && req.body[paramKey]);

      if (targetCustomerId && req.customerId && targetCustomerId !== req.customerId) {
        return next(
          new ForbiddenError('Cross-customer data access forbidden. You may only view your own records.')
        );
      }
    }

    next();
  };
};

