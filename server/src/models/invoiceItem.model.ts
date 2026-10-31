import mongoose, { Schema, Document, Model } from 'mongoose';
import { IInvoiceItem } from '../types';
import { Money } from '../utils/money';

export interface IInvoiceItemDocument extends Omit<IInvoiceItem, '_id'>, Document {}

const invoiceItemSchema = new Schema<IInvoiceItemDocument>(
  {
    invoice: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      required: [true, 'Invoice reference is required'],
      index: true,
    },
    subscriptionItem: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionItem',
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    variant: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariant',
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
      required: [true, 'Unit price snapshot is required'],
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Unit price snapshot cannot be negative',
      },
    },
    discountAmountSnapshot: {
      type: Schema.Types.Decimal128,
      default: () => Money.toDecimal128(0),
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Discount snapshot cannot be negative',
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
    taxAmountSnapshot: {
      type: Schema.Types.Decimal128,
      default: () => Money.toDecimal128(0),
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Tax amount snapshot cannot be negative',
      },
    },
    lineSubtotal: {
      type: Schema.Types.Decimal128,
      required: [true, 'Line subtotal is required'],
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Line subtotal cannot be negative',
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
    periodStartDate: {
      type: Date,
    },
    periodEndDate: {
      type: Date,
      validate: {
        validator: function (this: IInvoiceItemDocument, v: Date) {
          return !v || !this.periodStartDate || v >= this.periodStartDate;
        },
        message: 'Period end date must be on or after start date',
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
invoiceItemSchema.index({ invoice: 1, sortOrder: 1 });

export const InvoiceItem: Model<IInvoiceItemDocument> = mongoose.model<IInvoiceItemDocument>(
  'InvoiceItem',
  invoiceItemSchema
);
export default InvoiceItem;
