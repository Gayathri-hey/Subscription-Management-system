import mongoose from 'mongoose';
import Decimal from 'decimal.js';

// Configure Decimal.js for strict financial accuracy:
// 28 digits precision, Banker's / Half-Up rounding (ROUND_HALF_UP is standard in billing systems)
Decimal.set({
  precision: 28,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -7,
  toExpPos: 21,
});

export { Decimal };

/**
 * Monetary Strategy Documentation:
 * 
 * 1. Storage Strategy:
 *    - Monetary fields are stored in MongoDB as BSON Decimal128 (`Schema.Types.Decimal128`).
 *    - Decimal128 provides 128-bit IEEE 754-2008 decimal floating-point arithmetic with 34 decimal digits of precision.
 *    - This completely prevents binary floating-point representation artifacts (e.g. 0.1 + 0.2 != 0.3).
 * 
 * 2. Integer Minor Unit Strategy:
 *    - For integration with payment gateways (e.g., Stripe, Razorpay) that require integer minor units (cents/paise),
 *      `Money.toMinorUnits` and `Money.fromMinorUnits` provide exact lossless conversion between Decimal128 and integer minor units.
 * 
 * 3. Calculation Rule:
 *    - Under NO circumstances should JavaScript native floating-point operators (+, -, *, /) be used on monetary values.
 *    - All calculations MUST use the `Money` utility (powered by Decimal.js).
 */

export class Money {
  /**
   * Converts any numeric/string/Decimal/Decimal128 input into a Decimal.js instance.
   */
  public static from(val: mongoose.Types.Decimal128 | Decimal | string | number | bigint | null | undefined): Decimal {
    if (val === null || val === undefined) {
      return new Decimal(0);
    }
    if (val instanceof Decimal) {
      return val;
    }
    if (typeof val === 'object' && '_bsontype' in val && val._bsontype === 'Decimal128') {
      return new Decimal(val.toString());
    }
    return new Decimal(val.toString());
  }

  /**
   * Converts a Decimal, string, or number to a Mongoose Decimal128 instance with 2 decimal places.
   */
  public static toDecimal128(val: mongoose.Types.Decimal128 | Decimal | string | number | null | undefined): mongoose.Types.Decimal128 {
    if (val instanceof mongoose.Types.Decimal128) {
      return val;
    }
    const dec = Money.from(val);
    return mongoose.Types.Decimal128.fromString(dec.toFixed(2));
  }

  /**
   * Converts a Decimal, string, or number to a high-precision Decimal128 (e.g. for rates/percentages with up to 4 decimal places).
   */
  public static toRateDecimal128(val: mongoose.Types.Decimal128 | Decimal | string | number | null | undefined): mongoose.Types.Decimal128 {
    if (val instanceof mongoose.Types.Decimal128) {
      return val;
    }
    const dec = Money.from(val);
    return mongoose.Types.Decimal128.fromString(dec.toFixed(4));
  }

  /**
   * Pure addition: a + b
   */
  public static add(a: any, b: any): Decimal {
    return Money.from(a).plus(Money.from(b));
  }

  /**
   * Pure subtraction: a - b
   */
  public static subtract(a: any, b: any): Decimal {
    return Money.from(a).minus(Money.from(b));
  }

  /**
   * Pure multiplication: a * b
   */
  public static multiply(a: any, b: any): Decimal {
    return Money.from(a).times(Money.from(b));
  }

  /**
   * Pure division: a / b
   */
  public static divide(a: any, b: any): Decimal {
    const divisor = Money.from(b);
    if (divisor.isZero()) {
      throw new Error('Division by zero in financial calculation');
    }
    return Money.from(a).dividedBy(divisor);
  }

  /**
   * Computes percentage: (amount * rate) / 100
   * e.g. percentage('100.00', '18.00') => 18.00
   */
  public static percentage(amount: any, ratePercentage: any): Decimal {
    return Money.from(amount)
      .times(Money.from(ratePercentage))
      .dividedBy(new Decimal(100));
  }

  /**
   * Rounds a monetary amount to standard 2 decimal places.
   */
  public static round(amount: any, decimalPlaces: number = 2): Decimal {
    return Money.from(amount).toDecimalPlaces(decimalPlaces, Decimal.ROUND_HALF_UP);
  }

  /**
   * Formats a monetary amount into a fixed string.
   */
  public static format(amount: any, decimalPlaces: number = 2): string {
    return Money.round(amount, decimalPlaces).toFixed(decimalPlaces);
  }

  /**
   * Converts a monetary amount to integer minor units (e.g. cents/paise).
   * e.g. 19.99 USD -> 1999n cents.
   */
  public static toMinorUnits(amount: any, decimalPlaces: number = 2): bigint {
    const dec = Money.round(amount, decimalPlaces);
    const multiplier = new Decimal(10).pow(decimalPlaces);
    const minor = dec.times(multiplier).toFixed(0);
    return BigInt(minor);
  }

  /**
   * Converts an integer minor unit (e.g. 1999 cents) to Mongoose Decimal128 (19.99).
   */
  public static fromMinorUnits(minorUnits: bigint | number | string, decimalPlaces: number = 2): mongoose.Types.Decimal128 {
    const multiplier = new Decimal(10).pow(decimalPlaces);
    const dec = new Decimal(minorUnits.toString()).dividedBy(multiplier);
    return Money.toDecimal128(dec);
  }

  /**
   * Financial Line Item Calculator:
   * Calculates subtotal, discount, tax, and total for a single line item without floating-point errors.
   */
  public static calculateLineItem(params: {
    quantity: number;
    unitPrice: any;
    discountAmount?: any;
    taxRatePercentage?: any;
    isTaxInclusive?: boolean;
  }): {
    lineSubtotal: Decimal;
    discountAmount: Decimal;
    taxableAmount: Decimal;
    taxAmount: Decimal;
    lineTotal: Decimal;
  } {
    const qty = new Decimal(params.quantity);
    if (qty.isNegative()) {
      throw new Error('Quantity cannot be negative');
    }

    const unitPrice = Money.from(params.unitPrice);
    if (unitPrice.isNegative()) {
      throw new Error('Unit price cannot be negative');
    }

    // Line subtotal = unitPrice * quantity
    const lineSubtotal = Money.round(unitPrice.times(qty));

    // Discount amount
    let discountAmount = Money.round(params.discountAmount ?? 0);
    if (discountAmount.greaterThan(lineSubtotal)) {
      discountAmount = lineSubtotal;
    }

    // Taxable amount = subtotal - discount
    const taxableAmount = lineSubtotal.minus(discountAmount);

    const taxRate = Money.from(params.taxRatePercentage ?? 0);
    let taxAmount = new Decimal(0);
    let lineTotal = new Decimal(0);

    if (params.isTaxInclusive) {
      // If price includes tax: Tax = TaxableAmount - (TaxableAmount / (1 + (Rate / 100)))
      const taxFactor = new Decimal(1).plus(taxRate.dividedBy(100));
      const preTaxAmount = Money.round(taxableAmount.dividedBy(taxFactor));
      taxAmount = taxableAmount.minus(preTaxAmount);
      lineTotal = taxableAmount;
    } else {
      // Tax is added on top of taxable amount: Tax = TaxableAmount * Rate / 100
      taxAmount = Money.round(taxableAmount.times(taxRate).dividedBy(100));
      lineTotal = taxableAmount.plus(taxAmount);
    }

    return {
      lineSubtotal,
      discountAmount,
      taxableAmount,
      taxAmount,
      lineTotal,
    };
  }

  /**
   * Calculates total summary for an invoice or quotation from an array of calculated lines.
   */
  public static calculateTotals(
    lines: Array<{
      lineSubtotal: Decimal;
      discountAmount: Decimal;
      taxAmount: Decimal;
      lineTotal: Decimal;
    }>,
    additionalDiscount: any = 0
  ): {
    subtotal: Decimal;
    discountTotal: Decimal;
    taxTotal: Decimal;
    totalAmount: Decimal;
  } {
    let subtotal = new Decimal(0);
    let lineDiscountTotal = new Decimal(0);
    let taxTotal = new Decimal(0);

    for (const line of lines) {
      subtotal = subtotal.plus(line.lineSubtotal);
      lineDiscountTotal = lineDiscountTotal.plus(line.discountAmount);
      taxTotal = taxTotal.plus(line.taxAmount);
    }

    const extraDiscount = Money.round(additionalDiscount);
    const discountTotal = lineDiscountTotal.plus(extraDiscount);
    
    // totalAmount = subtotal - discountTotal + taxTotal
    let totalAmount = subtotal.minus(discountTotal).plus(taxTotal);
    if (totalAmount.isNegative()) {
      totalAmount = new Decimal(0);
    }

    return {
      subtotal: Money.round(subtotal),
      discountTotal: Money.round(discountTotal),
      taxTotal: Money.round(taxTotal),
      totalAmount: Money.round(totalAmount),
    };
  }

  /**
   * Helper to recursively transform Decimal128 fields to strings in toJSON transforms.
   */
  public static transformDecimal128(ret: Record<string, any>): Record<string, any> {
    if (!ret || typeof ret !== 'object') return ret;
    for (const key of Object.keys(ret)) {
      const val = ret[key];
      if (val && typeof val === 'object') {
        if (val._bsontype === 'Decimal128') {
          ret[key] = val.toString();
        } else if (!Array.isArray(val) && !(val instanceof Date)) {
          Money.transformDecimal128(val);
        }
      }
    }
    return ret;
  }
}
