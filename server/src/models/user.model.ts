import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser, UserRole, UserStatus } from '../types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      minlength: [60, 'Invalid password hash format'],
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'staff', 'customer'] as UserRole[],
        message: '{VALUE} is not a valid user role',
      },
      default: 'customer',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'suspended'] as UserStatus[],
        message: '{VALUE} is not a valid user status',
      },
      default: 'active',
      required: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [30, 'Phone number cannot exceed 30 characters'],
    },
    avatar: {
      type: String,
      trim: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete (ret as any).passwordHash;
        delete (ret as any).refreshToken;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Compound index for querying users by role and status
userSchema.index({ role: 1, status: 1 });
userSchema.index({ createdAt: -1 });

export const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema);
export default User;

