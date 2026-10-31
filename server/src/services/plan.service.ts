import mongoose from 'mongoose';
import { Plan } from '../models/plan.model';
import { PlanProduct } from '../models/planProduct.model';
import { Product } from '../models/product.model';
import { Money } from '../utils/money';
import { NotFoundError, ConflictError, BadRequestError } from '../middleware/errorHandler';
import type { CreatePlanInput, UpdatePlanInput, PlanQueryInput } from '../validators/plan.validator';

export class PlanService {

  /** List plans with pagination, search and filters */
  static async list(query: PlanQueryInput) {
    const { page, limit, search, status, billingInterval, isPublic, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (billingInterval) filter.billingCycle = billingInterval;
    if (isPublic !== undefined) filter.isPublic = isPublic;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { code: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    const sortField = sortBy === 'billingPrice' ? 'basePrice' : sortBy === 'billingInterval' ? 'billingCycle' : sortBy;
    const sort: Record<string, 1 | -1> = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

    const [plans, total] = await Promise.all([
      Plan.find(filter)
        .populate('taxRule', 'name code rate taxType')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Plan.countDocuments(filter),
    ]);

    // Attach products for each plan
    const planIds = plans.map((p: any) => p._id);
    const planProducts = await PlanProduct.find({ plan: { $in: planIds } })
      .populate('product', 'name code salesPrice status')
      .populate('variant', 'name value price')
      .lean();

    const ppMap: Record<string, any[]> = {};
    planProducts.forEach((pp: any) => {
      const key = pp.plan.toString();
      if (!ppMap[key]) ppMap[key] = [];
      ppMap[key].push(pp);
    });

    const enriched = plans.map((p: any) => ({
      ...p,
      products: ppMap[p._id.toString()] ?? [],
    }));

    return { plans: enriched, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Get single plan */
  static async getById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestError('Invalid plan ID');
    const plan = await Plan.findById(id)
      .populate('taxRule', 'name code rate taxType')
      .lean();
    if (!plan) throw new NotFoundError('Plan not found');

    const planProducts = await PlanProduct.find({ plan: id })
      .populate('product', 'name code salesPrice type category status')
      .populate('variant', 'name value price priceAdjustment')
      .lean();

    return { ...plan, products: planProducts };
  }

  /** Create a plan */
  static async create(input: CreatePlanInput) {
    const existing = await Plan.findOne({ code: input.code.toUpperCase() });
    if (existing) throw new ConflictError(`A plan with code "${input.code}" already exists`);

    const planData: Record<string, any> = {
      name: input.name,
      code: input.code.toUpperCase(),
      description: input.description,
      billingCycle: input.billingInterval,
      billingInterval: 1,
      basePrice: Money.toDecimal128(input.billingPrice),
      currency: input.currency,
      trialPeriodDays: input.trialPeriodDays,
      setupFee: Money.toDecimal128(input.setupFee),
      status: input.status,
      isPublic: input.isPublic,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      minimumQuantity: input.minimumQuantity,
      autoClose: input.autoClose,
      allowEarlyClosure: input.allowEarlyClosure,
      allowPause: input.allowPause,
      allowRenewal: input.allowRenewal,
      metadata: {},
    };

    if (input.taxRule) planData.taxRule = input.taxRule;

    const plan = await Plan.create(planData);

    // Add products
    if (input.products && input.products.length > 0) {
      await PlanService._syncPlanProducts(plan._id.toString(), input.products);
    }

    return PlanService.getById(plan._id.toString());
  }

  /** Update a plan */
  static async update(id: string, input: UpdatePlanInput) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestError('Invalid plan ID');
    const plan = await Plan.findById(id);
    if (!plan) throw new NotFoundError('Plan not found');

    if (input.code && input.code !== plan.code) {
      const conflict = await Plan.findOne({ code: input.code.toUpperCase(), _id: { $ne: id } });
      if (conflict) throw new ConflictError(`A plan with code "${input.code}" already exists`);
    }

    const updateData: Record<string, any> = { ...input };
    if (input.billingPrice !== undefined) updateData.basePrice = Money.toDecimal128(input.billingPrice);
    if (input.setupFee !== undefined) updateData.setupFee = Money.toDecimal128(input.setupFee);
    if (input.billingInterval !== undefined) updateData.billingCycle = input.billingInterval;
    if (input.code) updateData.code = input.code.toUpperCase();

    // Remove frontend-only keys that don't map to model fields
    delete updateData.billingPrice;
    delete updateData.billingInterval;
    delete updateData.products;

    await Plan.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

    if (input.products !== undefined) {
      await PlanService._syncPlanProducts(id, input.products);
    }

    return PlanService.getById(id);
  }

  /** Archive a plan */
  static async archive(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestError('Invalid plan ID');
    const plan = await Plan.findByIdAndUpdate(id, { $set: { status: 'archived' } }, { new: true });
    if (!plan) throw new NotFoundError('Plan not found');
    return plan;
  }

  /** Delete a plan */
  static async delete(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestError('Invalid plan ID');
    const plan = await Plan.findById(id);
    if (!plan) throw new NotFoundError('Plan not found');

    await PlanProduct.deleteMany({ plan: id });
    await Plan.findByIdAndDelete(id);
    return true;
  }

  /** Check if a plan is available for new subscriptions */
  static async isAvailable(id: string): Promise<{ available: boolean; reason?: string }> {
    if (!mongoose.Types.ObjectId.isValid(id)) return { available: false, reason: 'Invalid plan ID' };
    const plan = await Plan.findById(id).lean();
    if (!plan) return { available: false, reason: 'Plan not found' };
    if (plan.status !== 'active') return { available: false, reason: `Plan is ${plan.status}` };

    const now = new Date();
    const startDate = (plan as any).startDate;
    const endDate = (plan as any).endDate;

    if (startDate && now < new Date(startDate)) {
      return { available: false, reason: 'Plan has not started yet' };
    }
    if (endDate && now > new Date(endDate)) {
      return { available: false, reason: 'Plan has expired' };
    }

    return { available: true };
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  private static async _syncPlanProducts(planId: string, products: CreatePlanInput['products']) {
    // Validate product IDs
    const productIds = products!.map((p) => p.product);
    const validProducts = await Product.find({ _id: { $in: productIds } }).select('_id').lean();
    const validSet = new Set(validProducts.map((p: any) => p._id.toString()));

    for (const pp of products!) {
      if (!validSet.has(pp.product)) {
        throw new BadRequestError(`Product "${pp.product}" not found`);
      }
    }

    // Replace all plan_products
    await PlanProduct.deleteMany({ plan: planId });
    if (products!.length > 0) {
      const docs = products!.map((pp) => ({
        plan: planId,
        product: pp.product,
        variant: pp.variant,
        quantity: pp.quantity,
        unitPriceOverride: pp.unitPriceOverride !== undefined ? Money.toDecimal128(pp.unitPriceOverride) : undefined,
        isOptional: pp.isOptional,
        pricingType: pp.pricingType,
        sortOrder: pp.sortOrder,
      }));
      await PlanProduct.insertMany(docs);
    }
  }
}
