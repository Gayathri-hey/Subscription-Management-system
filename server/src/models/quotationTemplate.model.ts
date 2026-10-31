import mongoose, { Schema, Document, Model } from 'mongoose';
import { IQuotationTemplate, QuotationTemplateStatus, PaymentTerms } from '../types';

export interface IQuotationTemplateDocument extends Omit<IQuotationTemplate, '_id'>, Document {}

const quotationTemplateSchema = new Schema<IQuotationTemplateDocument>(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Template name must be at least 2 characters'],
      maxlength: [150, 'Template name cannot exceed 150 characters'],
    },
    code: {
      type: String,
      required: [true, 'Template code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9_-]+$/, 'Template code must contain only uppercase letters, numbers, underscores, and hyphens'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    validityDays: {
      type: Number,
      required: [true, 'Validity in days is required'],
      default: 30,
      min: [1, 'Validity must be at least 1 day'],
      max: [365, 'Validity cannot exceed 365 days'],
    },
    paymentTerms: {
      type: String,
      enum: {
        values: ['due_on_receipt', 'net_15', 'net_30', 'net_60'] as PaymentTerms[],
        message: '{VALUE} is not a valid payment term',
      },
      default: 'net_30',
      required: true,
    },
    termsAndConditions: {
      type: String,
      trim: true,
      maxlength: [5000, 'Terms and conditions cannot exceed 5000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'active', 'archived'] as QuotationTemplateStatus[],
        message: '{VALUE} is not a valid template status',
      },
      default: 'active',
      required: true,
      index: true,
    },
    defaultDiscount: {
      type: Schema.Types.ObjectId,
      ref: 'Discount',
    },
    defaultTaxRule: {
      type: Schema.Types.ObjectId,
      ref: 'TaxRule',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user reference is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
quotationTemplateSchema.index({ status: 1, createdAt: -1 });

export const QuotationTemplate: Model<IQuotationTemplateDocument> = mongoose.model<IQuotationTemplateDocument>(
  'QuotationTemplate',
  quotationTemplateSchema
);
export default QuotationTemplate;

