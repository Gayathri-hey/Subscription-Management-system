import mongoose, { Schema, Document, Model } from 'mongoose';
import { ISubscription, SubscriptionStatus, BillingCycle, PaymentMethod, DiscountType } from '../types';
import { Money } from '../utils/money';

export interface ISubscriptionDocument extends Omit<ISubscription, '_id'>, Document {}

const discountSnapshotSchema = new Schema(
  {
    code: { type: String, required: true, uppercase: true, trim: true },
    type: {
      type: String,
      enum: ['percentage', 'fixed_amount'] as DiscountType[],
      required: true,
    },
    value: {
      type: Schema.Types.Decimal128,
      required: true,
    },
  },
  { _id: false }
);

const subscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    subscriptionNumber: {
      type: String,
      required: [true, 'Subscription number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^SUB-[A-Z0-9-]+$/, 'Subscription number must follow the SUB-XXXX format'],
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
      index: true,
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
      required: [true, 'Plan reference is required'],
      index: true,
    },
    quotation: {
      type: Schema.Types.ObjectId,
      ref: 'Quotation',
    },
    status: {
      type: String,
      enum: {
        values: ['trialing', 'active', 'paused', 'past_due', 'cancelled', 'expired'] as SubscriptionStatus[],
        message: '{VALUE} is not a valid subscription status',
      },
      default: 'active',
      required: true,
      index: true,
    },
    billingCycle: {
      type: String,
      enum: {
        values: ['daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'yearly', 'one_time'] as BillingCycle[],
        message: '{VALUE} is not a valid billing cycle',
      },
      required: [true, 'Billing cycle is required'],
    },
    billingInterval: {
      type: Number,
      required: [true, 'Billing interval is required'],
      default: 1,
      min: [1, 'Billing interval must be at least 1'],
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
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    currentPeriodStart: {
      type: Date,
      required: [true, 'Current period start date is required'],
    },
    currentPeriodEnd: {
      type: Date,
      required: [true, 'Current period end date is required'],
      validate: {
        validator: function (this: ISubscriptionDocument, v: Date) {
          return !this.currentPeriodStart || v >= this.currentPeriodStart;
        },
        message: 'Current period end date must be on or after the start date',
      },
    },
    trialStart: {
      type: Date,
    },
    trialEnd: {
      type: Date,
      validate: {
        validator: function (this: ISubscriptionDocument, v: Date) {
          return !v || !this.trialStart || v >= this.trialStart;
        },
        message: 'Trial end date must be on or after trial start date',
      },
    },
    nextBillingDate: {
      type: Date,
      index: true,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    pausedAt: {
      type: Date,
    },
    pauseReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Pause reason cannot exceed 500 characters'],
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [1000, 'Cancellation reason cannot exceed 1000 characters'],
    },
    cancellationEffectiveDate: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
    discount: {
      type: Schema.Types.ObjectId,
      ref: 'Discount',
    },
    discountSnapshot: {
      type: discountSnapshotSchema,
    },
    defaultPaymentMethod: {
      type: String,
      enum: {
        values: ['card', 'bank_transfer', 'upi', 'cash', 'wallet', 'other'] as PaymentMethod[],
        message: '{VALUE} is not a valid payment method',
      },
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
subscriptionSchema.index({ customer: 1, status: 1 });
subscriptionSchema.index({ status: 1, nextBillingDate: 1 });
subscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });
subscriptionSchema.index({ createdAt: -1 });

export const Subscription: Model<ISubscriptionDocument> = mongoose.model<ISubscriptionDocument>(
  'Subscription',
  subscriptionSchema
);
export default Subscription;
