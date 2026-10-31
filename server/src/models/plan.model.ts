import mongoose, { Schema, Document, Model } from 'mongoose';
import { IPlan, PlanStatus, BillingCycle } from '../types';
import { Money } from '../utils/money';

export interface IPlanDocument extends Omit<IPlan, '_id'>, Document {}

const planSchema = new Schema<IPlanDocument>(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      minlength: [2, 'Plan name must be at least 2 characters'],
      maxlength: [150, 'Plan name cannot exceed 150 characters'],
    },
    code: {
      type: String,
      required: [true, 'Plan code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9_-]+$/, 'Plan code must contain only uppercase letters, numbers, underscores, and hyphens'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    basePrice: {
      type: Schema.Types.Decimal128,
      required: [true, 'Base price is required'],
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Base price cannot be negative',
      },
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'USD',
      uppercase: true,
      trim: true,
      minlength: [3, 'Currency must be a 3-letter ISO code'],
      maxlength: [3, 'Currency must be a 3-letter ISO code'],
    },
    billingCycle: {
      type: String,
      enum: {
        values: ['daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'yearly', 'one_time'] as BillingCycle[],
        message: '{VALUE} is not a valid billing cycle',
      },
      required: [true, 'Billing cycle is required'],
      index: true,
    },
    billingInterval: {
      type: Number,
      required: [true, 'Billing interval is required'],
      default: 1,
      min: [1, 'Billing interval must be at least 1'],
    },
    trialPeriodDays: {
      type: Number,
      default: 0,
      min: [0, 'Trial period cannot be negative'],
    },
    setupFee: {
      type: Schema.Types.Decimal128,
      default: () => Money.toDecimal128(0),
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Setup fee cannot be negative',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'active', 'archived'] as PlanStatus[],
        message: '{VALUE} is not a valid plan status',
      },
      default: 'active',
      required: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    taxRule: {
      type: Schema.Types.ObjectId,
      ref: 'TaxRule',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => Money.transformDecimal128(ret),
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => Money.transformDecimal128(ret),
    },
  }
);

// Indexes
planSchema.index({ status: 1, isPublic: 1 });
planSchema.index({ billingCycle: 1, status: 1 });

export const Plan: Model<IPlanDocument> = mongoose.model<IPlanDocument>('Plan', planSchema);
export default Plan;
