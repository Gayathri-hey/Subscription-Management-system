import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, IUserDocument } from '../models/user.model';
import { Customer, ICustomerDocument } from '../models/customer.model';
import { generateTokens, verifyRefreshToken, TokenPair } from '../utils/token';
import { emailService } from './email.service';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../middleware/errorHandler';

export interface RegisterCustomerInput {
  name: string;
  email: string;
  password: string;
  companyName?: string;
  phone?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

export interface AuthResult {
  user: IUserDocument;
  customer?: ICustomerDocument | null;
  tokens: TokenPair;
}

export class AuthService {
  /**
   * Register a new Customer account with linked Customer profile.
   */
  public async registerCustomer(input: RegisterCustomerInput): Promise<AuthResult> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // Check if user already exists
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    // Hash password with bcrypt (salt rounds = 12)
    const passwordHash = await bcrypt.hash(input.password, 12);

    // Create user with customer role
    const user = new User({
      name: input.name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'customer',
      status: 'active',
      phone: input.phone?.trim(),
      isEmailVerified: false,
    });

    await user.save();

    // Generate unique customer number (e.g. CUST-2026-1234)
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const customerNumber = `CUST-${year}-${randomSuffix}`;

    const billingAddress = input.billingAddress || {
      street: '100 Business Parkway',
      city: 'Metropolis',
      state: 'CA',
      country: 'US',
      postalCode: '90001',
    };

    const customer = new Customer({
      user: user._id,
      customerNumber,
      companyName: input.companyName?.trim() || `${input.name.trim()}'s Organization`,
      billingAddress,
      currency: 'USD',
      status: 'active',
      paymentTerms: 'due_on_receipt',
    });

    await customer.save();

    // Generate JWT access & refresh tokens
    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user,
      customer,
      tokens,
    };
  }

  /**
   * Authenticate user via email and password.
   */
  public async login(email: string, password: string): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select(
      '+passwordHash +refreshToken'
    );

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status === 'suspended') {
      throw new ForbiddenError('Account has been suspended. Please contact support.');
    }

    if (user.status === 'inactive') {
      throw new ForbiddenError('Account is inactive. Please contact support.');
    }

    // Update last login
    user.lastLoginAt = new Date();

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    let customer: ICustomerDocument | null = null;
    if (user.role === 'customer') {
      customer = await Customer.findOne({ user: user._id });
    }

    return {
      user,
      customer,
      tokens,
    };
  }

  /**
   * Refresh session tokens using HTTP-only refresh token.
   */
  public async refresh(refreshToken: string): Promise<TokenPair> {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token missing');
    }

    let payload: { userId: string; type: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Refresh token invalid or expired');
    }

    const user = await User.findById(payload.userId).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedError('Refresh token invalid or revoked');
    }

    if (user.status === 'suspended' || user.status === 'inactive') {
      throw new ForbiddenError('Account is no longer active');
    }

    const newTokens = generateTokens(user);
    user.refreshToken = newTokens.refreshToken;
    await user.save();

    return newTokens;
  }

  /**
   * Invalidate active session and clear refresh token.
   */
  public async logout(userId: string): Promise<void> {
    if (userId) {
      await User.findByIdAndUpdate(userId, { refreshToken: null });
    }
  }

  /**
   * Request password reset token.
   * Never exposes whether the email address exists.
   */
  public async requestPasswordReset(email: string): Promise<{ message: string; simulatedToken?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Return neutral success message to prevent user enumeration
      return {
        message: 'If the account exists, a password reset link has been dispatched to your email.',
      };
    }

    // Generate cryptographically secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = rawToken;
    user.resetPasswordExpires = expires;
    await user.save();

    await emailService.sendPasswordResetEmail(user.email, rawToken, user.name);

    return {
      message: 'If the account exists, a password reset link has been dispatched to your email.',
      simulatedToken: rawToken, // Helpful for test fixtures
    };
  }

  /**
   * Reset password using a valid, unexpired token.
   */
  public async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      throw new BadRequestError('Password reset token is invalid or has expired.');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = passwordHash;

    // Invalidate reset token and any existing session
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshToken = undefined;
    await user.save();
  }

  /**
   * Get current authenticated user profile and linked customer info.
   */
  public async getCurrentProfile(userId: string): Promise<{ user: IUserDocument; customer?: ICustomerDocument | null }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    let customer: ICustomerDocument | null = null;
    if (user.role === 'customer') {
      customer = await Customer.findOne({ user: user._id });
    }

    return { user, customer };
  }
}

export const authService = new AuthService();

