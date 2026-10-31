import mongoose from 'mongoose';
import { TaxRule } from '../models/taxRule.model';
import { Money, Decimal } from '../utils/money';
import { NotFoundError, ConflictError, BadRequestError } from '../middleware/errorHandler';
import type { CreateTaxRuleInput, UpdateTaxRuleInput, TaxRuleQueryInput } from '../validators/tax.validator';

// ─── Tax Calculation Result ────────────────────────────────────────────────────

export interface TaxCalculationResult {
  taxRuleId: string;
  taxRuleName: string;
  taxType: string;
  ratePercentage: string;
  isInclusive: boolean;
  isCompound: boolean;
  baseAmount: string;
  taxAmount: string;
  totalAmount: string;
}

// ─── Tax Service (Reusable Backend Service) ────────────────────────────────────

export class TaxService {

  /** List tax rules with pagination and filters */
  static async list(query: TaxRuleQueryInput) {
    const { page, limit, search, status, taxType, country, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (taxType) filter.taxType = taxType;
    if (country) filter.country = country.toUpperCase();
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { code: new RegExp(search, 'i') },
        { country: new RegExp(search, 'i') },
      ];
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [taxRules, total] = await Promise.all([
      TaxRule.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      TaxRule.countDocuments(filter),
    ]);

    return { taxRules, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Get single tax rule */
  static async getById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestError('Invalid tax rule ID');
    const taxRule = await TaxRule.findById(id).lean();
    if (!taxRule) throw new NotFoundError('Tax rule not found');
    return taxRule;
  }

  /** Create tax rule */
  static async create(input: CreateTaxRuleInput): Promise<any> {
    const existing = await TaxRule.findOne({ code: input.code.toUpperCase() });
    if (existing) throw new ConflictError(`A tax rule with code "${input.code}" already exists`);

    const taxRule = await TaxRule.create({
      name: input.name,
      code: input.code.toUpperCase(),
      taxType: input.taxType,
      rate: Money.toRateDecimal128(input.rate),
      country: input.country.toUpperCase(),
      state: input.state?.toUpperCase(),
      postalCode: input.postalCode,
      isCompound: input.isCompound,
      isInclusive: input.isInclusive,
      status: input.status,
      effectiveFrom: input.effectiveFrom,
      effectiveUntil: input.effectiveUntil ?? null,
    });

    return taxRule;
  }

  /** Update tax rule */
  static async update(id: string, input: UpdateTaxRuleInput): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestError('Invalid tax rule ID');
    const taxRule = await TaxRule.findById(id);
    if (!taxRule) throw new NotFoundError('Tax rule not found');

    if (input.code && input.code !== taxRule.code) {
      const conflict = await TaxRule.findOne({ code: input.code.toUpperCase(), _id: { $ne: id } });
      if (conflict) throw new ConflictError(`A tax rule with code "${input.code}" already exists`);
    }

    const updateData: Record<string, any> = { ...input };
    if (input.rate !== undefined) updateData.rate = Money.toRateDecimal128(input.rate);
    if (input.code) updateData.code = input.code.toUpperCase();
    if (input.country) updateData.country = input.country.toUpperCase();
    if (input.state) updateData.state = input.state.toUpperCase();

    const updated = await TaxRule.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    return updated;
  }

  /** Toggle status */
  static async toggleStatus(id: string, status: 'active' | 'inactive' | 'deprecated'): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestError('Invalid tax rule ID');
    const taxRule = await TaxRule.findByIdAndUpdate(id, { $set: { status } }, { new: true });
    if (!taxRule) throw new NotFoundError('Tax rule not found');
    return taxRule;
  }

  /**
   * Core reusable tax calculation engine.
   * Handles both tax-inclusive and tax-exclusive scenarios.
   * Uses precise Decimal.js arithmetic throughout.
   * 
   * @param amount - The base monetary amount (unit price × qty)
   * @param taxRuleId - MongoDB ID of the TaxRule to apply
   * @param quantity - Quantity (defaults to 1)
   * @returns Detailed TaxCalculationResult
   */
  static async calculate(
    amount: number | string | Decimal,
    taxRuleId: string,
    quantity: number = 1
  ): Promise<TaxCalculationResult> {
    if (!mongoose.Types.ObjectId.isValid(taxRuleId)) throw new BadRequestError('Invalid tax rule ID');

    const taxRule = await TaxRule.findById(taxRuleId).lean();
    if (!taxRule) throw new NotFoundError('Tax rule not found');
    if (taxRule.status !== 'active') throw new BadRequestError(`Tax rule "${taxRule.name}" is not active`);

    const now = new Date();
    if (taxRule.effectiveFrom && now < taxRule.effectiveFrom) {
      throw new BadRequestError(`Tax rule "${taxRule.name}" is not yet effective`);
    }
    if (taxRule.effectiveUntil && now > taxRule.effectiveUntil) {
      throw new BadRequestError(`Tax rule "${taxRule.name}" has expired`);
    }

    const qty = new Decimal(quantity);
    const baseAmount = Money.multiply(amount, qty);
    const rate = Money.from(taxRule.rate);

    let taxAmount: Decimal;
    let totalAmount: Decimal;

    if (taxRule.isInclusive) {
      // Tax is already included in the price
      // Extract tax: taxAmount = baseAmount - baseAmount / (1 + rate/100)
      const taxFactor = new Decimal(1).plus(rate.dividedBy(100));
      const preTaxAmount = Money.round(baseAmount.dividedBy(taxFactor));
      taxAmount = Money.round(baseAmount.minus(preTaxAmount));
      totalAmount = Money.round(baseAmount);
    } else {
      // Tax is added on top
      taxAmount = Money.round(Money.percentage(baseAmount, rate));
      totalAmount = Money.round(baseAmount.plus(taxAmount));
    }

    return {
      taxRuleId: taxRuleId,
      taxRuleName: taxRule.name,
      taxType: taxRule.taxType,
      ratePercentage: Money.format(rate, 4),
      isInclusive: taxRule.isInclusive,
      isCompound: taxRule.isCompound,
      baseAmount: Money.format(baseAmount),
      taxAmount: Money.format(taxAmount),
      totalAmount: Money.format(totalAmount),
    };
  }

  /**
   * Apply tax to a line item (used by billing/invoice modules).
   * Returns Decimal128-ready values for database storage.
   */
  static async applyToLineItem(
    unitPrice: number | string | Decimal,
    quantity: number,
    taxRuleId: string
  ): Promise<{
    lineSubtotal: Decimal;
    taxAmount: Decimal;
    lineTotal: Decimal;
    taxRateSnapshot: Decimal;
  }> {
    const taxRule = await TaxRule.findById(taxRuleId).lean();
    if (!taxRule) throw new NotFoundError('Tax rule not found');

    const result = Money.calculateLineItem({
      quantity,
      unitPrice,
      taxRatePercentage: taxRule.rate,
      isTaxInclusive: taxRule.isInclusive,
    });

    return {
      lineSubtotal: result.lineSubtotal,
      taxAmount: result.taxAmount,
      lineTotal: result.lineTotal,
      taxRateSnapshot: Money.from(taxRule.rate),
    };
  }

  /**
   * Get applicable tax rules for a given country/state.
   * Useful for subscription and invoice modules.
   */
  static async getApplicableRules(country: string, state?: string): Promise<any[]> {
    const now = new Date();
    const filter: Record<string, any> = {
      country: country.toUpperCase(),
      status: 'active',
      effectiveFrom: { $lte: now },
      $or: [{ effectiveUntil: null }, { effectiveUntil: { $gte: now } }],
    };
    if (state) filter.state = state.toUpperCase();
    return TaxRule.find(filter).lean();
  }
}
