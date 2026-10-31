import bcrypt from 'bcryptjs';
import { User, IUserDocument } from '../models/user.model';
import { ConflictError, NotFoundError } from '../middleware/errorHandler';
import { PaginationMeta, UserStatus } from '../types';

export interface CreateStaffInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
}

export interface UpdateStaffInput {
  name?: string;
  phone?: string;
  avatar?: string;
}

export class StaffService {
  /**
   * Create a new staff account (Admin only).
   */
  public async createStaff(input: CreateStaffInput): Promise<IUserDocument> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const staffUser = new User({
      name: input.name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'staff',
      status: 'active',
      phone: input.phone?.trim(),
      avatar: input.avatar?.trim(),
      isEmailVerified: true, // Staff accounts pre-verified by Admin
    });

    await staffUser.save();
    return staffUser;
  }

  /**
   * List all staff accounts with pagination and optional search filter.
   */
  public async listStaff(
    page = 1,
    limit = 10,
    search?: string
  ): Promise<{ staff: IUserDocument[]; meta: PaginationMeta }> {
    const query: Record<string, any> = { role: 'staff' };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;

    const staff = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      staff,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get staff member by ID.
   */
  public async getStaffById(id: string): Promise<IUserDocument> {
    const staff = await User.findOne({ _id: id, role: 'staff' });
    if (!staff) {
      throw new NotFoundError('Staff member not found');
    }
    return staff;
  }

  /**
   * Update staff member details.
   */
  public async updateStaff(id: string, input: UpdateStaffInput): Promise<IUserDocument> {
    const staff = await User.findOne({ _id: id, role: 'staff' });
    if (!staff) {
      throw new NotFoundError('Staff member not found');
    }

    if (input.name !== undefined) staff.name = input.name.trim();
    if (input.phone !== undefined) staff.phone = input.phone.trim();
    if (input.avatar !== undefined) staff.avatar = input.avatar.trim();

    await staff.save();
    return staff;
  }

  /**
   * Activate, deactivate, or suspend staff member.
   */
  public async updateStaffStatus(id: string, status: UserStatus): Promise<IUserDocument> {
    const staff = await User.findOne({ _id: id, role: 'staff' });
    if (!staff) {
      throw new NotFoundError('Staff member not found');
    }

    staff.status = status;
    if (status !== 'active') {
      staff.refreshToken = undefined; // Revoke current session
    }

    await staff.save();
    return staff;
  }
}

export const staffService = new StaffService();

