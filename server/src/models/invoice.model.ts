import mongoose, { Schema, Document, Model } from 'mongoose';
import { IInvoice, InvoiceStatus, InvoiceGeneratedBy, PaymentTerms } from '../types';
import { Money } from '../utils/money';

export interface IInvoiceDocument extends Omit<IInvoice, '_id'>, Document {}

const customerBillingSnapshotSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    companyName: { type: String, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, uppercase: true },
    postalCode: { type: String, required: true, trim: true },
    taxId: { type: String, trim: true, uppercase: true },
  },
  { _id: false }
);

const invoiceSchema = new Schema<IInvoiceDocument>(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^INV-[A-Z0-9-]+$/, 'Invoice number must follow the INV-XXXX format'],
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
      index: true,
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      index: true,
    },
    quotation: {
      type: Schema.Types.ObjectId,
      ref: 'Quotation',
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'issued', 'paid', 'partially_paid', 'overdue', 'void', 'refunded'] as InvoiceStatus[],
        message: '{VALUE} is not a valid invoice status',
      },
      default: 'draft',
      required: true,
      index: true,
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required'],
      default: Date.now,
      index: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      validate: {
        validator: function (this: IInvoiceDocument, v: Date) {
          return !this.issueDate || v >= this.issueDate;
        },
        message: 'Due date must be on or after issue date',
      },
      index: true,
    },
    paidAt: {
      type: Date,
    },
    voidedAt: {
      type: Date,
    },
    billingPeriodStart: {
      type: Date,
    },
    billingPeriodEnd: {
      type: Date,
      validate: {
        validator: function (this: IInvoiceDocument, v: Date) {
          return !v || !this.billingPeriodStart || v >= this.billingPeriodStart;
        },
        message: 'Billing period end must be on or after billing period start',
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
    amountPaid: {
      type: Schema.Types.Decimal128,
      required: [true, 'Amount paid is required'],
      default: () => Money.toDecimal128(0),
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Amount paid cannot be negative',
      },
    },
    amountDue: {
      type: Schema.Types.Decimal128,
      required: [true, 'Amount due is required'],
      default: () => Money.toDecimal128(0),
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Amount due cannot be negative',
      },
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    billingAddressSnapshot: {
      type: customerBillingSnapshotSchema,
      required: [true, 'Historical billing address snapshot is required'],
    },
    paymentTerms: {
      type: String,
      enum: {
        values: ['due_on_receipt', 'net_15', 'net_30', 'net_60'] as PaymentTerms[],
        message: '{VALUE} is not a valid payment term',
      },
      default: 'due_on_receipt',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    generatedBy: {
      type: String,
      enum: {
        values: ['system_cron', 'manual', 'quotation_conversion'] as InvoiceGeneratedBy[],
        message: '{VALUE} is not a valid generation source',
      },
      default: 'system_cron',
      required: true,
    },
    createdBy: {
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
invoiceSchema.index({ customer: 1, status: 1 });
invoiceSchema.index({ subscription: 1, status: 1 });
invoiceSchema.index({ status: 1, dueDate: 1 });
invoiceSchema.index({ createdAt: -1 });

export const Invoice: Model<IInvoiceDocument> = mongoose.model<IInvoiceDocument>('Invoice', invoiceSchema);
export default Invoice;
