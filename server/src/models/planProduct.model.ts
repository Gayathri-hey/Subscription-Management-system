import mongoose, { Schema, Document, Model } from 'mongoose';
import { IPlanProduct, PricingType } from '../types';
import { Money } from '../utils/money';

export interface IPlanProductDocument extends Omit<IPlanProduct, '_id'>, Document {}

const planProductSchema = new Schema<IPlanProductDocument>(
  {
    plan: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
      required: [true, 'Plan reference is required'],
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      index: true,
    },
    variant: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariant',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 1,
      min: [1, 'Quantity must be at least 1'],
    },
    unitPriceOverride: {
      type: Schema.Types.Decimal128,
      validate: {
        validator: (v: mongoose.Types.Decimal128) => v == null || Money.from(v).greaterThanOrEqualTo(0),
        message: 'Price override cannot be negative',
      },
    },
    isOptional: {
      type: Boolean,
      default: false,
    },
    pricingType: {
      type: String,
      enum: {
        values: ['flat_fee', 'per_unit', 'tiered', 'volume'] as PricingType[],
        message: '{VALUE} is not a valid pricing type',
      },
      default: 'per_unit',
      required: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
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

// Compound unique index ensuring no duplicate product/variant mapping within the same plan
planProductSchema.index({ plan: 1, product: 1, variant: 1 }, { unique: true });
planProductSchema.index({ plan: 1, sortOrder: 1 });

export const PlanProduct: Model<IPlanProductDocument> = mongoose.model<IPlanProductDocument>(
  'PlanProduct',
  planProductSchema
);
export default PlanProduct;
