import mongoose, { Schema, Document, Model } from 'mongoose';
import { IProduct, ProductStatus } from '../types';
import { Money } from '../utils/money';

export interface IProductDocument extends Omit<IProduct, '_id'>, Document {}

const productSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters'],
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: [true, 'Product code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [50, 'Product code cannot exceed 50 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    // Product type (e.g. Software, Hardware, Service)
    type: {
      type: String,
      trim: true,
      maxlength: [100, 'Type cannot exceed 100 characters'],
      default: 'Service',
    },
    // Sales price (customer-facing)
    salesPrice: {
      type: Schema.Types.Decimal128,
      required: [true, 'Sales price is required'],
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Sales price cannot be negative',
      },
      default: () => Money.toDecimal128(0),
    },
    // Cost price (internal)
    costPrice: {
      type: Schema.Types.Decimal128,
      validate: {
        validator: (v: mongoose.Types.Decimal128) => v == null || Money.from(v).greaterThanOrEqualTo(0),
        message: 'Cost price cannot be negative',
      },
    },
    // Internal notes
    notes: {
      type: String,
      trim: true,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'active', 'archived'] as ProductStatus[],
        message: '{VALUE} is not a valid product status',
      },
      default: 'active',
      required: true,
      index: true,
    },
    isRecurring: {
      type: Boolean,
      default: true,
    },
    taxRule: {
      type: Schema.Types.ObjectId,
      ref: 'TaxRule',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
productSchema.index({ category: 1, status: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ status: 1, createdAt: -1 });

export const Product: Model<IProductDocument> = mongoose.model<IProductDocument>('Product', productSchema);
export default Product;
