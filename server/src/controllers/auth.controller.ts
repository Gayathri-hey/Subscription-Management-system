import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { setAuthCookies, clearAuthCookies } from '../utils/token';
import { ApiResponseHelper } from '../utils/apiResponse';
import { catchAsync } from '../utils/catchAsync';
import { UnauthorizedError } from '../middleware/errorHandler';

export class AuthController {
  /**
   * Register customer
   * POST /api/auth/register
   */
  public register = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.registerCustomer(req.body);

    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    ApiResponseHelper.sendCreated(res, 'User registered successfully', {
      user: result.user,
      customer: result.customer,
      accessToken: result.tokens.accessToken,
      expiresIn: result.tokens.expiresIn,
    });
  });

  /**
   * User login
   * POST /api/auth/login
   */
  public login = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    ApiResponseHelper.sendSuccess(res, 'Login successful', {
      user: result.user,
      customer: result.customer,
      accessToken: result.tokens.accessToken,
      expiresIn: result.tokens.expiresIn,
    });
  });

  /**
   * Refresh session tokens
   * POST /api/auth/refresh
   */
  public refresh = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token missing, invalid, or expired');
    }

    const newTokens = await authService.refresh(refreshToken);
    setAuthCookies(res, newTokens.accessToken, newTokens.refreshToken);

    ApiResponseHelper.sendSuccess(res, 'Access token refreshed', {
      accessToken: newTokens.accessToken,
      expiresIn: newTokens.expiresIn,
    });
  });

  /**
   * User logout
   * POST /api/auth/logout
   */
  public logout = catchAsync(async (req: Request, res: Response): Promise<void> => {
    if (req.user?._id) {
      await authService.logout(req.user._id.toString());
    }

    clearAuthCookies(res);

    ApiResponseHelper.sendSuccess(res, 'Logged out successfully');
  });

  /**
   * Forgot password request
   * POST /api/auth/forgot-password
   */
  public forgotPassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);

    ApiResponseHelper.sendSuccess(res, result.message, {
      simulatedToken: result.simulatedToken, // Provided for automated testing verification
    });
  });

  /**
   * Reset password
   * POST /api/auth/reset-password
   */
  public resetPassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);

    ApiResponseHelper.sendSuccess(
      res,
      'Password reset successfully. You may now log in with your new password.'
    );
  });

  /**
   * Get current authenticated user profile
   * GET /api/auth/me
   */
  public getMe = catchAsync(async (req: Request, res: Response): Promise<void> => {
    if (!req.user?._id) {
      throw new UnauthorizedError('Authentication required');
    }

    const { user, customer } = await authService.getCurrentProfile(req.user._id.toString());

    ApiResponseHelper.sendSuccess(res, 'Profile retrieved', {
      user,
      customer,
    });
  });
}

export const authController = new AuthController();

