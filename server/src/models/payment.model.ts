import mongoose, { Schema, Document, Model } from 'mongoose';
import { IPayment, PaymentStatus, PaymentMethod } from '../types';
import { Money } from '../utils/money';

export interface IPaymentDocument extends Omit<IPayment, '_id'>, Document {}

const paymentSchema = new Schema<IPaymentDocument>(
  {
    paymentNumber: {
      type: String,
      required: [true, 'Payment number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^PAY-[A-Z0-9-]+$/, 'Payment number must follow the PAY-XXXX format'],
      index: true,
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      required: [true, 'Invoice reference is required'],
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
      index: true,
    },
    amount: {
      type: Schema.Types.Decimal128,
      required: [true, 'Payment amount is required'],
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThan(0),
        message: 'Payment amount must be greater than zero',
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
    status: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'] as PaymentStatus[],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'pending',
      required: true,
      index: true,
    },
    method: {
      type: String,
      enum: {
        values: ['card', 'bank_transfer', 'upi', 'cash', 'wallet', 'other'] as PaymentMethod[],
        message: '{VALUE} is not a valid payment method',
      },
      required: [true, 'Payment method is required'],
    },
    transactionId: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    gatewayProvider: {
      type: String,
      trim: true,
      maxlength: [50, 'Gateway provider name cannot exceed 50 characters'],
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
    },
    paidAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
      trim: true,
      maxlength: [1000, 'Failure reason cannot exceed 1000 characters'],
    },
    refundedAmount: {
      type: Schema.Types.Decimal128,
      default: () => Money.toDecimal128(0),
      validate: {
        validator: (v: mongoose.Types.Decimal128) => Money.from(v).greaterThanOrEqualTo(0),
        message: 'Refunded amount cannot be negative',
      },
    },
    refundTransactionId: {
      type: String,
      trim: true,
    },
    refundedAt: {
      type: Date,
    },
    recordedBy: {
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
paymentSchema.index({ invoice: 1, status: 1 });
paymentSchema.index({ customer: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

export const Payment: Model<IPaymentDocument> = mongoose.model<IPaymentDocument>('Payment', paymentSchema);
export default Payment;
