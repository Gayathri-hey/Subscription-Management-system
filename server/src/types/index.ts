import { Types } from 'mongoose';

// ─── User & Auth ──────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'staff' | 'customer';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface IUser {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  avatar?: string;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

// ─── API Response Wrappers ─────────────────────────────────────────────────────

export interface FieldError {
  field?: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: FieldError[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── System & Health ──────────────────────────────────────────────────────────

export interface HealthCheckData {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  timestamp: string;
  uptime: number;
  environment: string;
  database: {
    status: 'connected' | 'disconnected' | 'connecting' | 'disconnecting' | 'uninitialized';
    readyState: number;
    host?: string;
    name?: string;
  };
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
}

// ─── Shared Enums & Types ──────────────────────────────────────────────────────

export type BillingCycle = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'yearly' | 'one_time';

export type PaymentTerms = 'due_on_receipt' | 'net_15' | 'net_30' | 'net_60';

export type PaymentMethod = 'card' | 'bank_transfer' | 'upi' | 'cash' | 'wallet' | 'other';

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

// ─── Customer ─────────────────────────────────────────────────────────────────

export type CustomerStatus = 'active' | 'inactive' | 'suspended' | 'archived';

export interface ICustomer {
  _id: Types.ObjectId | string;
  user: Types.ObjectId | string;
  customerNumber: string;
  companyName?: string;
  billingAddress: Address;
  shippingAddress?: Address;
  taxId?: string;
  currency: string;
  status: CustomerStatus;
  defaultPaymentMethod?: PaymentMethod;
  paymentTerms: PaymentTerms;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Product & Variant ────────────────────────────────────────────────────────

export type ProductStatus = 'draft' | 'active' | 'archived';

export interface IProduct {
  _id: Types.ObjectId | string;
  name: string;
  slug: string;
  code: string;
  description?: string;
  category: string;
  type: string;
  salesPrice: Types.Decimal128;
  costPrice?: Types.Decimal128;
  notes?: string;
  status: ProductStatus;
  isRecurring: boolean;
  taxRule?: Types.ObjectId | string;
  createdBy?: Types.ObjectId | string;
  metadata?: Record<string, any>;
  variantsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type VariantStatus = 'active' | 'inactive' | 'discontinued';

export interface IVariantAttribute {
  name: string;
  value: string;
}

export interface IProductVariant {
  _id: Types.ObjectId | string;
  product: Types.ObjectId | string;
  name: string;
  value?: string;
  sku: string;
  price: Types.Decimal128;
  priceAdjustment: Types.Decimal128;
  currency: string;
  billingCycle: BillingCycle;
  attributes: IVariantAttribute[];
  features: string[];
  status: VariantStatus;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Plan & PlanProduct ───────────────────────────────────────────────────────

export type PlanStatus = 'draft' | 'active' | 'archived';

export interface IPlan {
  _id: Types.ObjectId | string;
  name: string;
  code: string;
  description?: string;
  basePrice: Types.Decimal128;
  currency: string;
  billingCycle: BillingCycle;
  billingInterval: number;
  trialPeriodDays: number;
  setupFee: Types.Decimal128;
  minimumQuantity: number;
  startDate: Date;
  endDate?: Date | null;
  autoClose: boolean;
  allowEarlyClosure: boolean;
  allowPause: boolean;
  allowRenewal: boolean;
  status: PlanStatus;
  isPublic: boolean;
  taxRule?: Types.ObjectId | string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type PricingType = 'flat_fee' | 'per_unit' | 'tiered' | 'volume';

export interface IPlanProduct {
  _id: Types.ObjectId | string;
  plan: Types.ObjectId | string;
  product: Types.ObjectId | string;
  variant?: Types.ObjectId | string;
  quantity: number;
  unitPriceOverride?: Types.Decimal128;
  isOptional: boolean;
  pricingType: PricingType;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Quotation Template & Lines ───────────────────────────────────────────────

export type QuotationTemplateStatus = 'draft' | 'active' | 'archived';

export interface IQuotationTemplate {
  _id: Types.ObjectId | string;
  name: string;
  code: string;
  description?: string;
  validityDays: number;
  paymentTerms: PaymentTerms;
  termsAndConditions?: string;
  status: QuotationTemplateStatus;
  defaultDiscount?: Types.ObjectId | string;
  defaultTaxRule?: Types.ObjectId | string;
  createdBy: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuotationTemplateLine {
  _id: Types.ObjectId | string;
  template: Types.ObjectId | string;
  product: Types.ObjectId | string;
  variant?: Types.ObjectId | string;
  plan?: Types.ObjectId | string;
  description: string;
  quantity: number;
  unitPrice: Types.Decimal128;
  discountPercentage: Types.Decimal128;
  taxRule?: Types.ObjectId | string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Quotation & Quotation Lines ──────────────────────────────────────────────

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

export interface IQuotation {
  _id: Types.ObjectId | string;
  quotationNumber: string;
  customer: Types.ObjectId | string;
  template?: Types.ObjectId | string;
  status: QuotationStatus;
  issueDate: Date;
  validUntil: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  convertedSubscription?: Types.ObjectId | string;
  currency: string;
  subtotal: Types.Decimal128;
  discountTotal: Types.Decimal128;
  taxTotal: Types.Decimal128;
  totalAmount: Types.Decimal128;
  termsAndConditions?: string;
  notes?: string;
  createdBy: Types.ObjectId | string;
  approvedBy?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuotationLine {
  _id: Types.ObjectId | string;
  quotation: Types.ObjectId | string;
  product: Types.ObjectId | string;
  variant?: Types.ObjectId | string;
  plan?: Types.ObjectId | string;
  description: string;
  quantity: number;
  unitPrice: Types.Decimal128; // historical snapshot
  discountAmount: Types.Decimal128;
  discount?: Types.ObjectId | string;
  taxRule?: Types.ObjectId | string;
  taxRateSnapshot: Types.Decimal128; // percentage e.g. 18.00
  taxAmount: Types.Decimal128;
  lineTotal: Types.Decimal128;
  billingCycleSnapshot?: BillingCycle;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Subscription & Subscription Items ────────────────────────────────────────

export type SubscriptionStatus = 'trialing' | 'active' | 'paused' | 'past_due' | 'cancelled' | 'expired';

export interface IDiscountSnapshot {
  code: string;
  type: DiscountType;
  value: Types.Decimal128;
}

export interface ISubscription {
  _id: Types.ObjectId | string;
  subscriptionNumber: string;
  customer: Types.ObjectId | string;
  plan: Types.ObjectId | string;
  quotation?: Types.ObjectId | string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  billingInterval: number;
  currency: string;
  startDate: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  nextBillingDate?: Date;
  autoRenew: boolean;
  pausedAt?: Date;
  pauseReason?: string;
  cancelledAt?: Date;
  cancellationReason?: string;
  cancellationEffectiveDate?: Date;
  endedAt?: Date;
  discount?: Types.ObjectId | string;
  discountSnapshot?: IDiscountSnapshot;
  defaultPaymentMethod?: PaymentMethod;
  metadata?: Record<string, any>;
  createdBy?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionItemStatus = 'active' | 'paused' | 'cancelled';

export interface ISubscriptionItem {
  _id: Types.ObjectId | string;
  subscription: Types.ObjectId | string;
  product: Types.ObjectId | string;
  variant?: Types.ObjectId | string;
  planProduct?: Types.ObjectId | string;
  description: string;
  quantity: number;
  unitPriceSnapshot: Types.Decimal128; // Grandfathered pricing snapshot
  taxRule?: Types.ObjectId | string;
  taxRateSnapshot: Types.Decimal128; // Grandfathered tax rate snapshot
  discountAmountSnapshot: Types.Decimal128;
  status: SubscriptionItemStatus;
  periodStartDate?: Date;
  periodEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Invoice & Invoice Items ──────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'partially_paid' | 'overdue' | 'void' | 'refunded';

export type InvoiceGeneratedBy = 'system_cron' | 'manual' | 'quotation_conversion';

export interface ICustomerBillingSnapshot {
  name: string;
  email: string;
  companyName?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxId?: string;
}

export interface IInvoice {
  _id: Types.ObjectId | string;
  invoiceNumber: string;
  customer: Types.ObjectId | string;
  subscription?: Types.ObjectId | string;
  quotation?: Types.ObjectId | string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  paidAt?: Date;
  voidedAt?: Date;
  billingPeriodStart?: Date;
  billingPeriodEnd?: Date;
  currency: string;
  subtotal: Types.Decimal128;
  discountTotal: Types.Decimal128;
  taxTotal: Types.Decimal128;
  totalAmount: Types.Decimal128;
  amountPaid: Types.Decimal128;
  amountDue: Types.Decimal128;
  isRecurring: boolean;
  billingAddressSnapshot: ICustomerBillingSnapshot;
  paymentTerms: PaymentTerms;
  notes?: string;
  generatedBy: InvoiceGeneratedBy;
  createdBy?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvoiceItem {
  _id: Types.ObjectId | string;
  invoice: Types.ObjectId | string;
  subscriptionItem?: Types.ObjectId | string;
  product?: Types.ObjectId | string;
  variant?: Types.ObjectId | string;
  description: string;
  quantity: number;
  unitPriceSnapshot: Types.Decimal128; // Historical preserved price
  discountAmountSnapshot: Types.Decimal128; // Historical preserved discount
  taxRule?: Types.ObjectId | string;
  taxRateSnapshot: Types.Decimal128; // Historical preserved tax rate
  taxAmountSnapshot: Types.Decimal128;
  lineSubtotal: Types.Decimal128; // quantity * unitPriceSnapshot
  lineTotal: Types.Decimal128; // (lineSubtotal - discountAmount) + taxAmount
  periodStartDate?: Date;
  periodEndDate?: Date;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';

export interface IPayment {
  _id: Types.ObjectId | string;
  paymentNumber: string;
  invoice: Types.ObjectId | string;
  customer: Types.ObjectId | string;
  amount: Types.Decimal128;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  gatewayProvider?: string;
  gatewayResponse?: Record<string, any>;
  paidAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  refundedAmount: Types.Decimal128;
  refundTransactionId?: string;
  refundedAt?: Date;
  recordedBy?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Discount & DiscountApplication ───────────────────────────────────────────

export type DiscountType = 'percentage' | 'fixed_amount';

export type DiscountStatus = 'draft' | 'active' | 'expired' | 'disabled';

export interface IDiscount {
  _id: Types.ObjectId | string;
  code: string;
  name: string;
  description?: string;
  type: DiscountType;
  value: Types.Decimal128; // percentage (e.g. 15.00) or fixed amount
  currency?: string;
  maxUses?: number;
  usedCount: number;
  minOrderAmount: Types.Decimal128;
  validFrom: Date;
  validUntil?: Date;
  applicablePlans: Array<Types.ObjectId | string>;
  applicableProducts: Array<Types.ObjectId | string>;
  status: DiscountStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type DiscountApplicationTarget = 'quotation' | 'subscription' | 'invoice';

export interface IDiscountApplication {
  _id: Types.ObjectId | string;
  discount: Types.ObjectId | string;
  customer: Types.ObjectId | string;
  appliedToEntity: DiscountApplicationTarget;
  appliedToId: Types.ObjectId | string;
  discountTypeSnapshot: DiscountType;
  discountValueSnapshot: Types.Decimal128;
  calculatedAmount: Types.Decimal128; // exact currency amount deducted
  appliedAt: Date;
  appliedBy?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── TaxRule ──────────────────────────────────────────────────────────────────

export type TaxType = 'sales_tax' | 'vat' | 'gst' | 'custom';

export type TaxRuleStatus = 'active' | 'inactive' | 'deprecated';

export interface ITaxRule {
  _id: Types.ObjectId | string;
  name: string;
  code: string;
  taxType: TaxType;
  rate: Types.Decimal128; // percentage (e.g. 18.00 for 18%)
  country: string; // ISO 3166-1 alpha-2
  state?: string;
  postalCode?: string;
  isCompound: boolean;
  isInclusive: boolean;
  status: TaxRuleStatus;
  effectiveFrom: Date;
  effectiveUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── AuditLog ─────────────────────────────────────────────────────────────────

export interface IAuditLog {
  _id: Types.ObjectId | string;
  actor?: Types.ObjectId | string;
  actorRole?: string;
  action: string;
  entity: string;
  entityId: Types.ObjectId | string;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
