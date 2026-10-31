import mongoose, { Schema, Document, Model } from 'mongoose';
import { IProductVariant, VariantStatus, BillingCycle } from '../types';
import { Money } from '../utils/money';

export interface IProductVariantDocument extends Omit<IProductVariant, '_id'>, Document {}

const attributeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const productVariantSchema = new Schema<IProductVariantDocument>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Associated product reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Variant name is required'],
      trim: true,
      minlength: [2, 'Variant name must be at least 2 characters'],
      maxlength: [150, 'Variant name cannot exceed 150 characters'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9_-]+$/, 'SKU must contain only uppercase letters, numbers, underscores, and hyphens'],
      index: true,
    },
    price: {
      type: Schema.Types.Decimal128,
      required: [true, 'Variant price is required'],
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Price cannot be negative',
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
      default: 'monthly',
      required: true,
    },
    attributes: [attributeSchema],
    features: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'discontinued'] as VariantStatus[],
        message: '{VALUE} is not a valid variant status',
      },
      default: 'active',
      required: true,
      index: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
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
productVariantSchema.index({ product: 1, status: 1 });
productVariantSchema.index({ product: 1, isDefault: 1 });

export const ProductVariant: Model<IProductVariantDocument> = mongoose.model<IProductVariantDocument>(
  'ProductVariant',
  productVariantSchema
);
export default ProductVariant;
