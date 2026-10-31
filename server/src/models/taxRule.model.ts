import mongoose, { Schema, Document, Model } from 'mongoose';
import { ITaxRule, TaxType, TaxRuleStatus } from '../types';
import { Money } from '../utils/money';

export interface ITaxRuleDocument extends Omit<ITaxRule, '_id'>, Document {}

const taxRuleSchema = new Schema<ITaxRuleDocument>(
  {
    name: {
      type: String,
      required: [true, 'Tax rule name is required'],
      trim: true,
      minlength: [2, 'Tax rule name must be at least 2 characters'],
      maxlength: [100, 'Tax rule name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Tax rule code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9_-]+$/, 'Tax rule code must contain only uppercase letters, numbers, underscores, and hyphens'],
      index: true,
    },
    taxType: {
      type: String,
      enum: {
        values: ['sales_tax', 'vat', 'gst', 'custom'] as TaxType[],
        message: '{VALUE} is not a valid tax type',
      },
      required: [true, 'Tax type is required'],
    },
    rate: {
      type: Schema.Types.Decimal128,
      required: [true, 'Tax rate percentage is required'],
      validate: {
        validator: (v: mongoose.Types.Decimal128) => {
          const val = Money.from(v);
          return val.greaterThanOrEqualTo(0) && val.lessThanOrEqualTo(100);
        },
        message: 'Tax rate must be between 0 and 100 percent',
      },
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      uppercase: true,
      trim: true,
      minlength: [2, 'Country code must be 2 characters'],
      maxlength: [2, 'Country code must be 2 characters'],
      index: true,
    },
    state: {
      type: String,
      uppercase: true,
      trim: true,
      maxlength: [50, 'State/region name cannot exceed 50 characters'],
    },
    postalCode: {
      type: String,
      trim: true,
    },
    isCompound: {
      type: Boolean,
      default: false,
    },
    isInclusive: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'deprecated'] as TaxRuleStatus[],
        message: '{VALUE} is not a valid tax rule status',
      },
      default: 'active',
      required: true,
      index: true,
    },
    effectiveFrom: {
      type: Date,
      required: [true, 'Effective from date is required'],
      default: Date.now,
    },
    effectiveUntil: {
      type: Date,
      validate: {
        validator: function (this: ITaxRuleDocument, v: Date) {
          return !v || !this.effectiveFrom || v >= this.effectiveFrom;
        },
        message: 'Effective until date must be on or after effective from date',
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

// Compound indexes
taxRuleSchema.index({ country: 1, state: 1, status: 1 });
taxRuleSchema.index({ status: 1, effectiveFrom: 1, effectiveUntil: 1 });

export const TaxRule: Model<ITaxRuleDocument> = mongoose.model<ITaxRuleDocument>('TaxRule', taxRuleSchema);
export default TaxRule;
