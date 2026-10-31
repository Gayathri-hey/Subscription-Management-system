import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { config } from '../config/env';
import { JwtPayload, UserRole } from '../types';
import { IUserDocument } from '../models/user.model';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const generateTokens = (user: IUserDocument): TokenPair => {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    role: user.role as UserRole,
    email: user.email,
  };

  const accessToken = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN as any,
  });

  const refreshToken = jwt.sign(
    { userId: user._id.toString(), type: 'refresh' },
    config.JWT_REFRESH_SECRET,
    {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN as any,
    }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
  };
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): { userId: string; type: string } => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as { userId: string; type: string };
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  const isProduction = config.NODE_ENV === 'production';

  // Access Token Cookie (7 days)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  // Refresh Token Cookie (30 days)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

export const clearAuthCookies = (res: Response): void => {
  const isProduction = config.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
    path: '/',
  };

  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};
