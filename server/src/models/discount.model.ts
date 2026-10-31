import mongoose, { Schema, Document, Model } from 'mongoose';
import { IDiscount, DiscountType, DiscountStatus } from '../types';
import { Money } from '../utils/money';

export interface IDiscountDocument extends Omit<IDiscount, '_id'>, Document {}

const discountSchema = new Schema<IDiscountDocument>(
  {
    code: {
      type: String,
      required: [true, 'Discount code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9_-]+$/, 'Discount code must contain only uppercase letters, numbers, underscores, and hyphens'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Discount name is required'],
      trim: true,
      minlength: [2, 'Discount name must be at least 2 characters'],
      maxlength: [100, 'Discount name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    type: {
      type: String,
      enum: {
        values: ['percentage', 'fixed_amount'] as DiscountType[],
        message: '{VALUE} is not a valid discount type',
      },
      required: [true, 'Discount type is required'],
    },
    value: {
      type: Schema.Types.Decimal128,
      required: [true, 'Discount value is required'],
      validate: {
        validator: function (this: IDiscountDocument, v: mongoose.Types.Decimal128) {
          const val = Money.from(v);
          if (val.isNegative()) return false;
          if (this.type === 'percentage' && val.greaterThan(100)) return false;
          return true;
        },
        message: 'Invalid discount value (must be >= 0, and <= 100 for percentage)',
      },
    },
    currency: {
      type: String,
      uppercase: true,
      trim: true,
      minlength: [3, 'Currency must be a 3-letter ISO code'],
      maxlength: [3, 'Currency must be a 3-letter ISO code'],
      validate: {
        validator: function (this: IDiscountDocument, v: string) {
          return this.type !== 'fixed_amount' || !!v;
        },
        message: 'Currency is required for fixed_amount discounts',
      },
    },
    maxUses: {
      type: Number,
      min: [1, 'Maximum uses must be at least 1'],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, 'Used count cannot be negative'],
    },
    minOrderAmount: {
      type: Schema.Types.Decimal128,
      default: () => Money.toDecimal128(0),
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Minimum order amount cannot be negative',
      },
    },
    validFrom: {
      type: Date,
      required: [true, 'Valid from date is required'],
      default: Date.now,
    },
    validUntil: {
      type: Date,
      validate: {
        validator: function (this: IDiscountDocument, v: Date) {
          return !v || !this.validFrom || v >= this.validFrom;
        },
        message: 'Valid until date must be on or after valid from date',
      },
    },
    applicablePlans: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Plan',
      },
    ],
    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    status: {
      type: String,
      enum: {
        values: ['draft', 'active', 'expired', 'disabled'] as DiscountStatus[],
        message: '{VALUE} is not a valid discount status',
      },
      default: 'active',
      required: true,
      index: true,
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
discountSchema.index({ status: 1, validFrom: 1, validUntil: 1 });

export const Discount: Model<IDiscountDocument> = mongoose.model<IDiscountDocument>('Discount', discountSchema);
export default Discount;
