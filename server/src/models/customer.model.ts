import mongoose, { Schema, Document, Model } from 'mongoose';
import { ICustomer, CustomerStatus, PaymentMethod, PaymentTerms } from '../types';

export interface ICustomerDocument extends Omit<ICustomer, '_id'>, Document {}

const addressSchema = new Schema(
  {
    street: { type: String, required: [true, 'Street address is required'], trim: true },
    city: { type: String, required: [true, 'City is required'], trim: true },
    state: { type: String, required: [true, 'State/Province is required'], trim: true },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      uppercase: true,
      minlength: [2, 'Country code must be at least 2 characters'],
      maxlength: [3, 'Country code cannot exceed 3 characters'],
    },
    postalCode: { type: String, required: [true, 'Postal code is required'], trim: true },
  },
  { _id: false }
);

const customerSchema = new Schema<ICustomerDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Associated user reference is required'],
      unique: true,
      index: true,
    },
    customerNumber: {
      type: String,
      required: [true, 'Customer number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^CUST-[A-Z0-9-]+$/, 'Customer number must follow the CUST-XXXX format'],
      index: true,
    },
    companyName: {
      type: String,
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    billingAddress: {
      type: addressSchema,
      required: [true, 'Billing address is required'],
    },
    shippingAddress: {
      type: addressSchema,
    },
    taxId: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [50, 'Tax ID cannot exceed 50 characters'],
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
        values: ['active', 'inactive', 'suspended', 'archived'] as CustomerStatus[],
        message: '{VALUE} is not a valid customer status',
      },
      default: 'active',
      required: true,
      index: true,
    },
    defaultPaymentMethod: {
      type: String,
      enum: {
        values: ['card', 'bank_transfer', 'upi', 'cash', 'wallet', 'other'] as PaymentMethod[],
        message: '{VALUE} is not a valid payment method',
      },
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
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
customerSchema.index({ status: 1, createdAt: -1 });
customerSchema.index({ 'billingAddress.country': 1 });
customerSchema.index({ companyName: 1 });

export const Customer: Model<ICustomerDocument> = mongoose.model<ICustomerDocument>('Customer', customerSchema);
export default Customer;

