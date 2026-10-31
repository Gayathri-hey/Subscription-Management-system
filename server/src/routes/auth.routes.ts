import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new customer account
 * @access  Public
 */
router.post('/register', authLimiter, validateBody(registerSchema), authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & establish session
 * @access  Public
 */
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh session tokens via httpOnly refresh token cookie
 * @access  Public (requires cookie/token)
 */
router.post('/refresh', authController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Log out active user and invalidate token
 * @access  Protected
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email link
 * @access  Public
 */
router.post(
  '/forgot-password',
  authLimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using email token
 * @access  Public
 */
router.post(
  '/reset-password',
  authLimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword
);

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user & linked customer profile
 * @access  Protected
 */
router.get('/me', authenticate, authController.getMe);

export default router;
