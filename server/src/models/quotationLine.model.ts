import mongoose, { Schema, Document, Model } from 'mongoose';
import { IQuotationLine, BillingCycle } from '../types';
import { Money } from '../utils/money';

export interface IQuotationLineDocument extends Omit<IQuotationLine, '_id'>, Document {}

const quotationLineSchema = new Schema<IQuotationLineDocument>(
  {
    quotation: {
      type: Schema.Types.ObjectId,
      ref: 'Quotation',
      required: [true, 'Quotation reference is required'],
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
    plan: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
    },
    description: {
      type: String,
      required: [true, 'Line description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 1,
      min: [1, 'Quantity must be at least 1'],
    },
    unitPrice: {
      type: Schema.Types.Decimal128,
      required: [true, 'Unit price is required'],
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Unit price cannot be negative',
      },
    },
    discountAmount: {
      type: Schema.Types.Decimal128,
      default: () => Money.toDecimal128(0),
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Discount amount cannot be negative',
      },
    },
    discount: {
      type: Schema.Types.ObjectId,
      ref: 'Discount',
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
        message: 'Tax rate must be between 0 and 100',
      },
    },
    taxAmount: {
      type: Schema.Types.Decimal128,
      default: () => Money.toDecimal128(0),
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Tax amount cannot be negative',
      },
    },
    lineTotal: {
      type: Schema.Types.Decimal128,
      required: [true, 'Line total is required'],
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Line total cannot be negative',
      },
    },
    billingCycleSnapshot: {
      type: String,
      enum: {
        values: ['daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'yearly', 'one_time'] as BillingCycle[],
        message: '{VALUE} is not a valid billing cycle',
      },
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

// Indexes
quotationLineSchema.index({ quotation: 1, sortOrder: 1 });

export const QuotationLine: Model<IQuotationLineDocument> = mongoose.model<IQuotationLineDocument>(
  'QuotationLine',
  quotationLineSchema
);
export default QuotationLine;
