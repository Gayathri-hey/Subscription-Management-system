import mongoose, { Schema, Document, Model } from 'mongoose';
import { IQuotation, QuotationStatus } from '../types';
import { Money } from '../utils/money';

export interface IQuotationDocument extends Omit<IQuotation, '_id'>, Document {}

const quotationSchema = new Schema<IQuotationDocument>(
  {
    quotationNumber: {
      type: String,
      required: [true, 'Quotation number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^QT-[A-Z0-9-]+$/, 'Quotation number must follow the QT-XXXX format'],
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
      index: true,
    },
    template: {
      type: Schema.Types.ObjectId,
      ref: 'QuotationTemplate',
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'] as QuotationStatus[],
        message: '{VALUE} is not a valid quotation status',
      },
      default: 'draft',
      required: true,
      index: true,
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required'],
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: [true, 'Valid until date is required'],
      validate: {
        validator: function (this: IQuotationDocument, v: Date) {
          return !this.issueDate || v >= this.issueDate;
        },
        message: 'Valid until date must be on or after the issue date',
      },
    },
    acceptedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [1000, 'Rejection reason cannot exceed 1000 characters'],
    },
    convertedSubscription: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
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
    subtotal: {
      type: Schema.Types.Decimal128,
      required: [true, 'Subtotal is required'],
      default: () => Money.toDecimal128(0),
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Subtotal cannot be negative',
      },
    },
    discountTotal: {
      type: Schema.Types.Decimal128,
      required: [true, 'Discount total is required'],
      default: () => Money.toDecimal128(0),
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Discount total cannot be negative',
      },
    },
    taxTotal: {
      type: Schema.Types.Decimal128,
      required: [true, 'Tax total is required'],
      default: () => Money.toDecimal128(0),
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Tax total cannot be negative',
      },
    },
    totalAmount: {
      type: Schema.Types.Decimal128,
      required: [true, 'Total amount is required'],
      default: () => Money.toDecimal128(0),
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Total amount cannot be negative',
      },
    },
    termsAndConditions: {
      type: String,
      trim: true,
      maxlength: [5000, 'Terms and conditions cannot exceed 5000 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user reference is required'],
      index: true,
    },
    approvedBy: {
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

// Indexes
quotationSchema.index({ customer: 1, status: 1 });
quotationSchema.index({ status: 1, validUntil: 1 });
quotationSchema.index({ createdAt: -1 });

export const Quotation: Model<IQuotationDocument> = mongoose.model<IQuotationDocument>('Quotation', quotationSchema);
export default Quotation;
