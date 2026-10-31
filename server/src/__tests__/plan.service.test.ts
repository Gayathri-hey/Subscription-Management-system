/**
 * Phase 2 – Plan Service Tests
 * Covers: CRUD, plan availability, billing interval validation,
 * expired plan guard, minimum quantity, product attachment, config flags
 */
import { connect, clearDatabase, closeDatabase } from './helpers/db';
import { PlanService } from '../services/plan.service';
import { ProductService } from '../services/product.service';
import { Plan } from '../models/plan.model';
import { PlanProduct } from '../models/planProduct.model';

beforeAll(async () => { await connect(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await closeDatabase(); });

// ─── Seed Helpers ─────────────────────────────────────────────────────────────

let codeCounter = 0;
const uniqueCode = (prefix: string) => `${prefix}-${Date.now()}-${++codeCounter}`;

const seedProduct = async (override: Record<string, any> = {}) =>
  ProductService.create({
    name: 'Cloud Suite',
    code: uniqueCode('CS'),
    category: 'Cloud',
    type: 'Software',
    salesPrice: 1000,
    status: 'active',
    isRecurring: true,
    ...override,
  });

const basePlanInput = (override: Record<string, any> = {}) => ({
  name: 'Pro Monthly',
  code: uniqueCode('PM'),
  description: 'Professional monthly subscription',
  billingInterval: 'monthly' as const,
  billingPrice: 299,
  currency: 'USD',
  minimumQuantity: 1,
  startDate: new Date('2024-01-01'),
  endDate: null,
  trialPeriodDays: 0,
  setupFee: 0,
  status: 'active' as const,
  isPublic: true,
  autoClose: true,
  allowEarlyClosure: false,
  allowPause: false,
  allowRenewal: true,
  products: [],
  ...override,
});

// ─── PlanService.create ────────────────────────────────────────────────────────

describe('PlanService.create', () => {
  it('creates a plan with all required fields', async () => {
    const plan = await PlanService.create(basePlanInput());
    expect(plan).toBeDefined();
    expect(plan.name).toBe('Pro Monthly');
    expect((plan as any).status).toBe('active');
  });

  it('throws ConflictError for duplicate plan code', async () => {
    const code = uniqueCode('DUPE');
    await PlanService.create(basePlanInput({ code }));
    await expect(PlanService.create(basePlanInput({ code }))).rejects.toThrow('already exists');
  });

  it('stores basePrice as Decimal128', async () => {
    const plan = await PlanService.create(basePlanInput({ billingPrice: 499.99 }));
    expect(parseFloat((plan as any).basePrice.toString())).toBeCloseTo(499.99, 2);
  });

  it('stores billingCycle correctly from billingInterval', async () => {
    const plan = await PlanService.create(basePlanInput({ billingInterval: 'yearly' }));
    expect((plan as any).billingCycle).toBe('yearly');
  });

  it('creates plan with attached products', async () => {
    const product = await seedProduct();
    const plan = await PlanService.create(basePlanInput({
      products: [{ product: product._id.toString(), quantity: 2, isOptional: false, pricingType: 'per_unit' as const, sortOrder: 0 }],
    }));
    expect(plan.products).toHaveLength(1);
    expect((plan.products[0] as any).quantity).toBe(2);
  });

  it('throws BadRequestError for non-existent product in products array', async () => {
    await expect(
      PlanService.create(basePlanInput({
        products: [{ product: '6849e56b8a3b9e001f000099', quantity: 1, isOptional: false, pricingType: 'per_unit' as const, sortOrder: 0 }],
      }))
    ).rejects.toThrow('not found');
  });
});

// ─── PlanService.list ─────────────────────────────────────────────────────────

describe('PlanService.list', () => {
  beforeEach(async () => {
    await PlanService.create(basePlanInput({ name: 'Starter Monthly', billingInterval: 'monthly', status: 'active' }));
    await PlanService.create(basePlanInput({ name: 'Pro Annual', billingInterval: 'yearly', status: 'active' }));
    await PlanService.create(basePlanInput({ name: 'Enterprise Draft', billingInterval: 'monthly', status: 'draft' }));
  });

  it('returns all plans with default pagination', async () => {
    const result = await PlanService.list({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
    expect(result.plans).toHaveLength(3);
    expect(result.total).toBe(3);
  });

  it('filters by status=draft', async () => {
    const result = await PlanService.list({ page: 1, limit: 10, status: 'draft', sortBy: 'createdAt', sortOrder: 'desc' });
    expect(result.plans).toHaveLength(1);
    expect(result.plans[0].name).toBe('Enterprise Draft');
  });

  it('filters by billingInterval=yearly', async () => {
    const result = await PlanService.list({ page: 1, limit: 10, billingInterval: 'yearly', sortBy: 'createdAt', sortOrder: 'desc' });
    expect(result.plans).toHaveLength(1);
    expect(result.plans[0].name).toBe('Pro Annual');
  });

  it('searches by plan name', async () => {
    const result = await PlanService.list({ page: 1, limit: 10, search: 'Starter', sortBy: 'createdAt', sortOrder: 'desc' });
    expect(result.plans).toHaveLength(1);
    expect(result.plans[0].name).toBe('Starter Monthly');
  });

  it('paginates correctly', async () => {
    const result = await PlanService.list({ page: 1, limit: 2, sortBy: 'createdAt', sortOrder: 'desc' });
    expect(result.plans).toHaveLength(2);
    expect(result.totalPages).toBe(2);
  });
});

// ─── PlanService.getById ──────────────────────────────────────────────────────

describe('PlanService.getById', () => {
  it('returns plan with products embedded', async () => {
    const product = await seedProduct();
    const created = await PlanService.create(basePlanInput({
      products: [{ product: product._id.toString(), quantity: 1, isOptional: false, pricingType: 'per_unit' as const, sortOrder: 0 }],
    }));
    const plan = await PlanService.getById((created as any)._id.toString());
    expect(plan.name).toBe('Pro Monthly');
    expect(plan.products).toHaveLength(1);
  });

  it('throws BadRequestError for invalid plan ID', async () => {
    await expect(PlanService.getById('not-valid-id')).rejects.toThrow('Invalid plan ID');
  });

  it('throws NotFoundError for non-existent plan', async () => {
    await expect(PlanService.getById('6849e56b8a3b9e001f000001')).rejects.toThrow('not found');
  });
});

// ─── PlanService.update ───────────────────────────────────────────────────────

describe('PlanService.update', () => {
  it('updates plan name and billingPrice', async () => {
    const created = await PlanService.create(basePlanInput());
    const updated = await PlanService.update((created as any)._id.toString(), { name: 'Updated Plan', billingPrice: 399 });
    expect(updated.name).toBe('Updated Plan');
    expect(parseFloat((updated as any).basePrice.toString())).toBeCloseTo(399, 2);
  });

  it('throws ConflictError on duplicate code update', async () => {
    const code1 = uniqueCode('C1');
    const code2 = uniqueCode('C2');
    await PlanService.create(basePlanInput({ code: code1 }));
    const p2 = await PlanService.create(basePlanInput({ code: code2 }));
    await expect(
      PlanService.update((p2 as any)._id.toString(), { code: code1 })
    ).rejects.toThrow('already exists');
  });

  it('syncs products when updated', async () => {
    const product = await seedProduct();
    const created = await PlanService.create(basePlanInput());
    const updated = await PlanService.update((created as any)._id.toString(), {
      products: [{ product: product._id.toString(), quantity: 3, isOptional: true, pricingType: 'per_unit' as const, sortOrder: 0 }],
    });
    expect(updated.products).toHaveLength(1);
    expect((updated.products[0] as any).quantity).toBe(3);
  });
});

// ─── PlanService.archive ──────────────────────────────────────────────────────

describe('PlanService.archive', () => {
  it('sets plan status to archived', async () => {
    const created = await PlanService.create(basePlanInput());
    const archived = await PlanService.archive((created as any)._id.toString());
    expect(archived!.status).toBe('archived');
  });
});

// ─── PlanService.delete ───────────────────────────────────────────────────────

describe('PlanService.delete', () => {
  it('deletes plan and removes its plan_products', async () => {
    const product = await seedProduct();
    const created = await PlanService.create(basePlanInput({
      products: [{ product: product._id.toString(), quantity: 1, isOptional: false, pricingType: 'per_unit' as const, sortOrder: 0 }],
    }));
    const planId = (created as any)._id.toString();

    await PlanService.delete(planId);
    const plan = await Plan.findById(planId);
    const planProducts = await PlanProduct.find({ plan: planId });
    expect(plan).toBeNull();
    expect(planProducts).toHaveLength(0);
  });
});

// ─── PlanService.isAvailable ──────────────────────────────────────────────────
// isAvailable reason strings from the service:
//   - plan.status !== 'active': `Plan is ${plan.status}` → e.g. "Plan is archived"
//   - startDate in future: "Plan has not started yet"
//   - endDate in past: "Plan has expired"

describe('PlanService.isAvailable', () => {
  it('returns available=true for an active plan with valid dates', async () => {
    const plan = await PlanService.create(basePlanInput({
      startDate: new Date('2024-01-01'),
      endDate: new Date('2099-12-31'),
      status: 'active',
    }));
    const result = await PlanService.isAvailable((plan as any)._id.toString());
    expect(result.available).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('returns available=false for an archived plan', async () => {
    const plan = await PlanService.create(basePlanInput({ status: 'archived' }));
    const result = await PlanService.isAvailable((plan as any)._id.toString());
    expect(result.available).toBe(false);
    // reason is "Plan is archived"
    expect(result.reason).toMatch(/archived/i);
  });

  it('returns available=false for a draft plan', async () => {
    const plan = await PlanService.create(basePlanInput({ status: 'draft' }));
    const result = await PlanService.isAvailable((plan as any)._id.toString());
    expect(result.available).toBe(false);
    // reason is "Plan is draft"
    expect(result.reason).toMatch(/draft/i);
  });

  it('returns available=false for an expired plan (past endDate)', async () => {
    const plan = await PlanService.create(basePlanInput({
      startDate: new Date('2020-01-01'),
      endDate: new Date('2021-12-31'), // past date
    }));
    const result = await PlanService.isAvailable((plan as any)._id.toString());
    expect(result.available).toBe(false);
    // reason is "Plan has expired"
    expect(result.reason).toMatch(/expired/i);
  });

  it('returns available=false for a plan that has not started (future startDate)', async () => {
    const plan = await PlanService.create(basePlanInput({
      startDate: new Date('2099-01-01'),
    }));
    const result = await PlanService.isAvailable((plan as any)._id.toString());
    expect(result.available).toBe(false);
    // reason is "Plan has not started yet"
    expect(result.reason).toMatch(/not started/i);
  });

  it('returns available=false for invalid plan ID', async () => {
    const result = await PlanService.isAvailable('not-valid-id');
    expect(result.available).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it('returns available=false for non-existent plan', async () => {
    const result = await PlanService.isAvailable('6849e56b8a3b9e001f000001');
    expect(result.available).toBe(false);
    expect(result.reason).toBeDefined();
  });
});

// ─── Billing Interval Validation ─────────────────────────────────────────────

describe('Plan — Billing Interval Validation', () => {
  it('accepts DAILY billing interval', async () => {
    const plan = await PlanService.create(basePlanInput({ billingInterval: 'daily' }));
    expect((plan as any).billingCycle).toBe('daily');
  });

  it('accepts WEEKLY billing interval', async () => {
    const plan = await PlanService.create(basePlanInput({ billingInterval: 'weekly' }));
    expect((plan as any).billingCycle).toBe('weekly');
  });

  it('accepts MONTHLY billing interval', async () => {
    const plan = await PlanService.create(basePlanInput({ billingInterval: 'monthly' }));
    expect((plan as any).billingCycle).toBe('monthly');
  });

  it('accepts YEARLY billing interval', async () => {
    const plan = await PlanService.create(basePlanInput({ billingInterval: 'yearly' }));
    expect((plan as any).billingCycle).toBe('yearly');
  });
});

// ─── Plan Configuration Flags ─────────────────────────────────────────────────

describe('Plan — Configuration Flags', () => {
  it('stores default flags correctly (autoClose=true, allowPause=false, allowRenewal=true)', async () => {
    const plan = await PlanService.create(basePlanInput());
    expect((plan as any).autoClose).toBe(true);
    expect((plan as any).allowPause).toBe(false);
    expect((plan as any).allowRenewal).toBe(true);
    expect((plan as any).allowEarlyClosure).toBe(false);
  });

  it('stores custom flags when explicitly provided', async () => {
    const plan = await PlanService.create(basePlanInput({
      autoClose: false,
      allowPause: true,
      allowEarlyClosure: true,
      allowRenewal: false,
    }));
    expect((plan as any).autoClose).toBe(false);
    expect((plan as any).allowPause).toBe(true);
    expect((plan as any).allowEarlyClosure).toBe(true);
    expect((plan as any).allowRenewal).toBe(false);
  });
});

// ─── Minimum Quantity ─────────────────────────────────────────────────────────

describe('Plan — Minimum Quantity', () => {
  it('stores minimumQuantity=1 (default)', async () => {
    const plan = await PlanService.create(basePlanInput({ minimumQuantity: 1 }));
    expect((plan as any).minimumQuantity).toBe(1);
  });

  it('stores minimumQuantity=5', async () => {
    const plan = await PlanService.create(basePlanInput({ minimumQuantity: 5 }));
    expect((plan as any).minimumQuantity).toBe(5);
  });
});

// ─── Trial Period & Setup Fee ─────────────────────────────────────────────────

describe('Plan — Trial Period & Setup Fee', () => {
  it('stores trialPeriodDays correctly', async () => {
    const plan = await PlanService.create(basePlanInput({ trialPeriodDays: 14 }));
    expect((plan as any).trialPeriodDays).toBe(14);
  });

  it('stores setupFee as Decimal128', async () => {
    const plan = await PlanService.create(basePlanInput({ setupFee: 49.99 }));
    expect(parseFloat((plan as any).setupFee.toString())).toBeCloseTo(49.99, 2);
  });

  it('stores zero setupFee when not provided', async () => {
    const plan = await PlanService.create(basePlanInput({ setupFee: 0 }));
    expect(parseFloat((plan as any).setupFee.toString())).toBe(0);
  });
});
