import bcrypt from 'bcryptjs';
import { User, IUserDocument } from '../models/user.model';
import { Customer, ICustomerDocument } from '../models/customer.model';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../middleware/errorHandler';

export interface UpdateCustomerProfileInput {
  name?: string;
  phone?: string;
  companyName?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

export class CustomerService {
  /**
   * Get customer profile & details by user ID.
   */
  public async getProfile(
    userId: string
  ): Promise<{ user: IUserDocument; customer: ICustomerDocument | null }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User account not found');
    }

    const customer = await Customer.findOne({ user: user._id });
    return { user, customer };
  }

  /**
   * Update customer profile details.
   */
  public async updateProfile(
    userId: string,
    input: UpdateCustomerProfileInput
  ): Promise<{ user: IUserDocument; customer: ICustomerDocument | null }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User account not found');
    }

    if (input.name !== undefined) user.name = input.name.trim();
    if (input.phone !== undefined) user.phone = input.phone.trim();
    await user.save();

    let customer = await Customer.findOne({ user: user._id });
    if (customer) {
      if (input.companyName !== undefined) customer.companyName = input.companyName.trim();
      if (input.billingAddress) {
        customer.billingAddress = {
          street: input.billingAddress.street.trim(),
          city: input.billingAddress.city.trim(),
          state: input.billingAddress.state.trim(),
          country: input.billingAddress.country.trim().toUpperCase(),
          postalCode: input.billingAddress.postalCode.trim(),
        };
      }
      await customer.save();
    }

    return { user, customer };
  }

  /**
   * Change account password.
   */
  public async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw new NotFoundError('User account not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new BadRequestError('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.refreshToken = undefined; // Revoke old sessions
    await user.save();
  }
}

export const customerService = new CustomerService();

