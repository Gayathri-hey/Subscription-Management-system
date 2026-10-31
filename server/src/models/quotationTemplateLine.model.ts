import mongoose, { Schema, Document, Model } from 'mongoose';
import { IQuotationTemplateLine } from '../types';
import { Money } from '../utils/money';

export interface IQuotationTemplateLineDocument extends Omit<IQuotationTemplateLine, '_id'>, Document {}

const quotationTemplateLineSchema = new Schema<IQuotationTemplateLineDocument>(
  {
    template: {
      type: Schema.Types.ObjectId,
      ref: 'QuotationTemplate',
      required: [true, 'Template reference is required'],
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
    discountPercentage: {
      type: Schema.Types.Decimal128,
      default: () => Money.toRateDecimal128(0),
      validate: {
        validator: (v: mongoose.Types.Decimal128) => {
          const val = Money.from(v);
          return val.greaterThanOrEqualTo(0) && val.lessThanOrEqualTo(100);
        },
        message: 'Discount percentage must be between 0 and 100',
      },
    },
    taxRule: {
      type: Schema.Types.ObjectId,
      ref: 'TaxRule',
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
quotationTemplateLineSchema.index({ template: 1, sortOrder: 1 });

export const QuotationTemplateLine: Model<IQuotationTemplateLineDocument> =
  mongoose.model<IQuotationTemplateLineDocument>('QuotationTemplateLine', quotationTemplateLineSchema);
export default QuotationTemplateLine;
