/**
 * Phase 2 – Product Service Tests
 * Covers: CRUD, variant management, variant price arithmetic
 */
import { connect, clearDatabase, closeDatabase } from './helpers/db';
import { ProductService } from '../services/product.service';
import { ProductVariant } from '../models/productVariant.model';

beforeAll(async () => { await connect(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await closeDatabase(); });

// ─── Seed helper ───────────────────────────────────────────────────────────────

const baseProductInput = (override: Record<string, any> = {}) => ({
  name: 'Cloud Suite',
  code: 'CS-001',
  category: 'Cloud Services',
  type: 'Software',
  salesPrice: 1000,
  costPrice: 600,
  description: 'Enterprise cloud software',
  notes: 'Renewal monthly',
  status: 'active' as const,
  isRecurring: true,
  ...override,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProductService.create', () => {
  it('creates a product successfully with all required fields', async () => {
    const product = await ProductService.create(baseProductInput());
    expect(product).toBeDefined();
    expect(product.name).toBe('Cloud Suite');
    expect(product.code).toBe('CS-001');
  });

  it('auto-generates a slug on creation', async () => {
    const product = await ProductService.create(baseProductInput());
    expect(product.slug).toBeDefined();
    expect(product.slug).toMatch(/cloud-suite/);
  });

  it('throws ConflictError for duplicate product code', async () => {
    await ProductService.create(baseProductInput());
    await expect(ProductService.create(baseProductInput())).rejects.toThrow('already exists');
  });

  it('stores salesPrice as Decimal128', async () => {
    const product = await ProductService.create(baseProductInput({ salesPrice: 1500 }));
    // Mongoose Decimal128 stores as fixed-point string, e.g. '1500.00'
    expect(parseFloat(product.salesPrice.toString())).toBe(1500);
  });
});

describe('ProductService.list', () => {
  beforeEach(async () => {
    await ProductService.create(baseProductInput({ name: 'Alpha Software', code: 'ALPHA', status: 'active' }));
    await ProductService.create(baseProductInput({ name: 'Beta Service', code: 'BETA', status: 'draft' }));
    await ProductService.create(baseProductInput({ name: 'Gamma Tool', code: 'GAMMA', category: 'Tools', status: 'active' }));
  });

  it('returns all products with default pagination', async () => {
    const result = await ProductService.list({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
    expect(result.products).toHaveLength(3);
    expect(result.total).toBe(3);
  });

  it('filters by status=draft', async () => {
    const result = await ProductService.list({ page: 1, limit: 10, status: 'draft', sortBy: 'createdAt', sortOrder: 'desc' });
    expect(result.products).toHaveLength(1);
    expect(result.products[0].status).toBe('draft');
  });

  it('searches by product name', async () => {
    const result = await ProductService.list({ page: 1, limit: 10, search: 'Alpha', sortBy: 'createdAt', sortOrder: 'desc' });
    expect(result.products).toHaveLength(1);
    expect(result.products[0].name).toBe('Alpha Software');
  });

  it('filters by category', async () => {
    const result = await ProductService.list({ page: 1, limit: 10, category: 'Tools', sortBy: 'createdAt', sortOrder: 'desc' });
    expect(result.products).toHaveLength(1);
  });

  it('paginates correctly', async () => {
    const result = await ProductService.list({ page: 1, limit: 2, sortBy: 'createdAt', sortOrder: 'desc' });
    expect(result.products).toHaveLength(2);
    expect(result.totalPages).toBe(2);
  });
});

describe('ProductService.getById', () => {
  it('returns product with variants', async () => {
    const product = await ProductService.create(baseProductInput());
    const result = await ProductService.getById(product._id.toString());
    expect(result).toBeDefined();
    expect(result.name).toBe('Cloud Suite');
    expect(result.variants).toBeInstanceOf(Array);
  });

  it('throws BadRequestError for invalid ID', async () => {
    await expect(ProductService.getById('not-valid-id')).rejects.toThrow('Invalid product ID');
  });

  it('throws NotFoundError for non-existent product', async () => {
    await expect(ProductService.getById('6849e56b8a3b9e001f000001')).rejects.toThrow('not found');
  });
});

describe('ProductService.update', () => {
  it('updates product name and salesPrice', async () => {
    const product = await ProductService.create(baseProductInput());
    const updated = await ProductService.update(product._id.toString(), { name: 'Updated Suite', salesPrice: 1200 });
    expect(updated!.name).toBe('Updated Suite');
    expect(parseFloat(updated!.salesPrice.toString())).toBe(1200);
  });

  it('throws ConflictError on duplicate code update', async () => {
    const p1 = await ProductService.create(baseProductInput({ code: 'P-001' }));
    const p2 = await ProductService.create(baseProductInput({ name: 'Other', code: 'P-002' }));
    await expect(
      ProductService.update(p2._id.toString(), { code: 'P-001' })
    ).rejects.toThrow('already exists');
  });
});

describe('ProductService.archive', () => {
  it('sets product status to archived', async () => {
    const product = await ProductService.create(baseProductInput());
    const archived = await ProductService.archive(product._id.toString());
    expect(archived!.status).toBe('archived');
  });
});

// ─── Variant Price Arithmetic ─────────────────────────────────────────────────

describe('ProductService — Variant Price Calculations', () => {
  it('calculates variant price as salesPrice + priceAdjustment', async () => {
    // Base: $1000, Adjustment: $560 → Final: $1560
    const product = await ProductService.create(baseProductInput({ salesPrice: 1000 }));
    const variant = await ProductService.createVariant(product._id.toString(), {
      name: 'Brand',
      value: 'Odoo',
      priceAdjustment: 560,
      status: 'active',
    });
    expect(parseFloat(variant.price.toString())).toBe(1560);
    expect(parseFloat(variant.priceAdjustment.toString())).toBe(560);
  });

  it('allows zero price adjustment (variant = base price)', async () => {
    const product = await ProductService.create(baseProductInput({ salesPrice: 1000 }));
    const variant = await ProductService.createVariant(product._id.toString(), {
      name: 'Tier',
      value: 'Standard',
      priceAdjustment: 0,
      status: 'active',
    });
    expect(parseFloat(variant.price.toString())).toBe(1000);
  });

  it('throws BadRequestError if variant price becomes negative', async () => {
    const product = await ProductService.create(baseProductInput({ salesPrice: 100 }));
    await expect(
      ProductService.createVariant(product._id.toString(), {
        name: 'Discount',
        value: 'Heavy',
        priceAdjustment: -500, // would make price -400
        status: 'active',
      })
    ).rejects.toThrow('cannot be negative');
  });

  it('recalculates price correctly on variant update', async () => {
    const product = await ProductService.create(baseProductInput({ salesPrice: 1000 }));
    const variant = await ProductService.createVariant(product._id.toString(), {
      name: 'Brand',
      value: 'Odoo',
      priceAdjustment: 200,
      status: 'active',
    });

    // Update adjustment from 200 to 400 → final should be $1400
    const updated = await ProductService.updateVariant(
      product._id.toString(),
      variant._id.toString(),
      { priceAdjustment: 400 }
    );
    expect(parseFloat(updated!.price.toString())).toBe(1400);
  });

  it('handles decimal price adjustments with precision', async () => {
    // Decimal arithmetic check: 999.99 + 0.01 = 1000.00
    const product = await ProductService.create(baseProductInput({ salesPrice: 999.99 }));
    const variant = await ProductService.createVariant(product._id.toString(), {
      name: 'Precision',
      value: 'Test',
      priceAdjustment: 0.01,
      status: 'active',
    });
    expect(parseFloat(variant.price.toString())).toBeCloseTo(1000.00, 2);
  });
});

describe('ProductService — Variant CRUD', () => {
  it('lists variants for a product', async () => {
    const product = await ProductService.create(baseProductInput());
    await ProductService.createVariant(product._id.toString(), { name: 'Tier', value: 'Pro', priceAdjustment: 100, status: 'active' });
    await ProductService.createVariant(product._id.toString(), { name: 'Tier', value: 'Enterprise', priceAdjustment: 500, status: 'active' });

    const variants = await ProductService.getVariants(product._id.toString());
    expect(variants).toHaveLength(2);
  });

  it('deletes a variant', async () => {
    const product = await ProductService.create(baseProductInput());
    const variant = await ProductService.createVariant(product._id.toString(), { name: 'Size', value: 'Large', priceAdjustment: 50, status: 'active' });

    await ProductService.deleteVariant(product._id.toString(), variant._id.toString());
    const remaining = await ProductVariant.find({ product: product._id });
    expect(remaining).toHaveLength(0);
  });
});
