import mongoose, { Schema, Document, Model } from 'mongoose';
import { IDiscountApplication, DiscountApplicationTarget, DiscountType } from '../types';
import { Money } from '../utils/money';

export interface IDiscountApplicationDocument extends Omit<IDiscountApplication, '_id'>, Document {}

const discountApplicationSchema = new Schema<IDiscountApplicationDocument>(
  {
    discount: {
      type: Schema.Types.ObjectId,
      ref: 'Discount',
      required: [true, 'Discount reference is required'],
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
      index: true,
    },
    appliedToEntity: {
      type: String,
      enum: {
        values: ['quotation', 'subscription', 'invoice'] as DiscountApplicationTarget[],
        message: '{VALUE} is not a valid target entity for discount application',
      },
      required: [true, 'Target entity is required'],
      index: true,
    },
    appliedToId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Target document ID is required'],
      index: true,
    },
    discountTypeSnapshot: {
      type: String,
      enum: ['percentage', 'fixed_amount'] as DiscountType[],
      required: [true, 'Discount type snapshot is required'],
    },
    discountValueSnapshot: {
      type: Schema.Types.Decimal128,
      required: [true, 'Discount value snapshot is required'],
    },
    calculatedAmount: {
      type: Schema.Types.Decimal128,
      required: [true, 'Calculated discount amount is required'],
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Calculated discount amount cannot be negative',
      },
    },
    appliedAt: {
      type: Date,
      required: [true, 'Applied at timestamp is required'],
      default: Date.now,
    },
    appliedBy: {
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

// Compound indexes
discountApplicationSchema.index({ appliedToEntity: 1, appliedToId: 1 });
discountApplicationSchema.index({ discount: 1, customer: 1 });

export const DiscountApplication: Model<IDiscountApplicationDocument> = mongoose.model<IDiscountApplicationDocument>(
  'DiscountApplication',
  discountApplicationSchema
);
export default DiscountApplication;
