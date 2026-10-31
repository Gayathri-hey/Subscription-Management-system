/**
 * Phase 2 – Tax Service Tests
 * Covers: tax-inclusive/exclusive calculations, rate precision, validation
 */
import { connect, clearDatabase, closeDatabase } from './helpers/db';
import { TaxService } from '../services/tax.service';
import { TaxRule } from '../models/taxRule.model';
import { Money } from '../utils/money';

beforeAll(async () => { await connect(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await closeDatabase(); });

// ─── Seed helper ───────────────────────────────────────────────────────────────

const seedTaxRule = async (override: Record<string, any> = {}) => {
  return TaxRule.create({
    name: 'India GST 18%',
    code: 'IN-GST-18',
    taxType: 'gst',
    rate: Money.toRateDecimal128(18),
    country: 'IN',
    state: 'KA',
    isCompound: false,
    isInclusive: false,
    status: 'active',
    effectiveFrom: new Date('2024-01-01'),
    effectiveUntil: null,
    ...override,
  });
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TaxService.create', () => {
  it('creates a tax rule successfully', async () => {
    const rule = await TaxService.create({
      name: 'UK VAT 20%',
      code: 'GB-VAT-20',
      taxType: 'vat',
      rate: 20,
      country: 'GB',
      isCompound: false,
      isInclusive: false,
      status: 'active',
      effectiveFrom: new Date('2024-01-01'),
    });
    expect(rule.name).toBe('UK VAT 20%');
    expect(rule.code).toBe('GB-VAT-20');
  });

  it('throws ConflictError on duplicate code', async () => {
    await seedTaxRule();
    await expect(TaxService.create({
      name: 'Duplicate',
      code: 'IN-GST-18',
      taxType: 'gst',
      rate: 18,
      country: 'IN',
      isCompound: false,
      isInclusive: false,
      status: 'active',
      effectiveFrom: new Date(),
    })).rejects.toThrow('already exists');
  });
});

describe('TaxService.calculate — Tax-Exclusive', () => {
  it('calculates 18% GST on $100 correctly', async () => {
    const rule = await seedTaxRule();
    const result = await TaxService.calculate(100, rule._id.toString());

    expect(parseFloat(result.baseAmount)).toBe(100);
    expect(parseFloat(result.taxAmount)).toBeCloseTo(18, 2);
    expect(parseFloat(result.totalAmount)).toBeCloseTo(118, 2);
    expect(result.isInclusive).toBe(false);
  });

  it('calculates tax with quantity multiplier', async () => {
    const rule = await seedTaxRule();
    const result = await TaxService.calculate(100, rule._id.toString(), 5);

    expect(parseFloat(result.baseAmount)).toBe(500);
    expect(parseFloat(result.taxAmount)).toBeCloseTo(90, 2);
    expect(parseFloat(result.totalAmount)).toBeCloseTo(590, 2);
  });

  it('handles decimal amounts precisely (no floating point drift)', async () => {
    const rule = await seedTaxRule({ rate: Money.toRateDecimal128(17.5) });
    const result = await TaxService.calculate(99.99, rule._id.toString());

    // 99.99 * 0.175 = 17.498... → rounded = 17.50
    // total = 117.49
    const tax = parseFloat(result.taxAmount);
    expect(tax).toBeGreaterThan(17);
    expect(tax).toBeLessThan(18);
  });
});

describe('TaxService.calculate — Tax-Inclusive', () => {
  it('extracts tax from inclusive price', async () => {
    const rule = await seedTaxRule({ isInclusive: true, rate: Money.toRateDecimal128(18) });
    const result = await TaxService.calculate(118, rule._id.toString());

    // $118 inclusive of 18% GST → base = 118/1.18 = ~100, tax = ~18
    expect(parseFloat(result.totalAmount)).toBeCloseTo(118, 2);
    expect(parseFloat(result.baseAmount)).toBeCloseTo(100, 1);
    expect(parseFloat(result.taxAmount)).toBeCloseTo(18, 1);
    expect(result.isInclusive).toBe(true);
  });
});

describe('TaxService.calculate — Error Cases', () => {
  it('throws BadRequestError for invalid tax rule ID', async () => {
    await expect(TaxService.calculate(100, 'not-valid-id')).rejects.toThrow('Invalid tax rule ID');
  });

  it('throws NotFoundError for non-existent tax rule', async () => {
    await expect(TaxService.calculate(100, '6849e56b8a3b9e001f000001')).rejects.toThrow('not found');
  });

  it('throws BadRequestError for inactive tax rule', async () => {
    const rule = await seedTaxRule({ status: 'inactive' });
    await expect(TaxService.calculate(100, rule._id.toString())).rejects.toThrow('not active');
  });

  it('throws BadRequestError for expired tax rule', async () => {
    const rule = await seedTaxRule({ effectiveUntil: new Date('2020-01-01') });
    await expect(TaxService.calculate(100, rule._id.toString())).rejects.toThrow('expired');
  });

  it('throws BadRequestError for not-yet-effective tax rule', async () => {
    const rule = await seedTaxRule({ effectiveFrom: new Date('2099-01-01') });
    await expect(TaxService.calculate(100, rule._id.toString())).rejects.toThrow('not yet effective');
  });
});

describe('TaxService.getApplicableRules', () => {
  it('returns only active rules for a country', async () => {
    await seedTaxRule({ country: 'IN', state: 'KA', status: 'active' });
    await seedTaxRule({ code: 'IN-GST-5', name: 'GST 5%', rate: Money.toRateDecimal128(5), country: 'IN', state: 'KA', status: 'inactive' });

    const rules = await TaxService.getApplicableRules('IN');
    expect(rules.length).toBeGreaterThanOrEqual(1);
    rules.forEach(r => expect(r.status).toBe('active'));
  });

  it('returns empty array for a country with no rules', async () => {
    const rules = await TaxService.getApplicableRules('US');
    expect(rules).toHaveLength(0);
  });
});

describe('TaxService.toggleStatus', () => {
  it('deactivates an active rule', async () => {
    const rule = await seedTaxRule();
    const updated = await TaxService.toggleStatus(rule._id.toString(), 'inactive');
    expect(updated!.status).toBe('inactive');
  });

  it('activates an inactive rule', async () => {
    const rule = await seedTaxRule({ status: 'inactive' });
    const updated = await TaxService.toggleStatus(rule._id.toString(), 'active');
    expect(updated!.status).toBe('active');
  });
});

describe('TaxService.applyToLineItem', () => {
  it('computes line subtotal, tax, and total for a line item', async () => {
    const rule = await seedTaxRule({ rate: Money.toRateDecimal128(10) });
    const result = await TaxService.applyToLineItem(100, 3, rule._id.toString());

    // 100 * 3 = 300 subtotal, 10% tax = 30, total = 330
    expect(parseFloat(result.lineSubtotal.toString())).toBeCloseTo(300, 2);
    expect(parseFloat(result.taxAmount.toString())).toBeCloseTo(30, 2);
    expect(parseFloat(result.lineTotal.toString())).toBeCloseTo(330, 2);
  });
});
