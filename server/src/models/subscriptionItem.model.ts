import mongoose, { Schema, Document, Model } from 'mongoose';
import { ISubscriptionItem, SubscriptionItemStatus } from '../types';
import { Money } from '../utils/money';

export interface ISubscriptionItemDocument extends Omit<ISubscriptionItem, '_id'>, Document {}

const subscriptionItemSchema = new Schema<ISubscriptionItemDocument>(
  {
    subscription: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      required: [true, 'Subscription reference is required'],
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    variant: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariant',
    },
    planProduct: {
      type: Schema.Types.ObjectId,
      ref: 'PlanProduct',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 1,
      min: [1, 'Quantity must be at least 1'],
    },
    unitPriceSnapshot: {
      type: Schema.Types.Decimal128,
      required: [true, 'Historical unit price snapshot is required'],
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Unit price snapshot cannot be negative',
      },
    },
    taxRule: {
      type: Schema.Types.ObjectId,
      ref: 'TaxRule',
    },
    taxRateSnapshot: {
      type: Schema.Types.Decimal128,
      default: () => Money.toRateDecimal128(0),
      validate: {
        validator: (v: mongoose.Types.Decimal128) => {
          const val = Money.from(v);
          return val.greaterThanOrEqualTo(0) && val.lessThanOrEqualTo(100);
        },
        message: 'Tax rate snapshot must be between 0 and 100',
      },
    },
    discountAmountSnapshot: {
      type: Schema.Types.Decimal128,
      default: () => Money.toDecimal128(0),
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Discount amount snapshot cannot be negative',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'paused', 'cancelled'] as SubscriptionItemStatus[],
        message: '{VALUE} is not a valid subscription item status',
      },
      default: 'active',
      required: true,
      index: true,
    },
    periodStartDate: {
      type: Date,
    },
    periodEndDate: {
      type: Date,
      validate: {
        validator: function (this: ISubscriptionItemDocument, v: Date) {
          return !v || !this.periodStartDate || v >= this.periodStartDate;
        },
        message: 'Period end date must be on or after start date',
      },
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
subscriptionItemSchema.index({ subscription: 1, status: 1 });
subscriptionItemSchema.index({ subscription: 1, product: 1 });

export const SubscriptionItem: Model<ISubscriptionItemDocument> = mongoose.model<ISubscriptionItemDocument>(
  'SubscriptionItem',
  subscriptionItemSchema
);
export default SubscriptionItem;
