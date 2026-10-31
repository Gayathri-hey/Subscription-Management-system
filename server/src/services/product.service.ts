import mongoose from 'mongoose';
import { Product } from '../models/product.model';
import { ProductVariant } from '../models/productVariant.model';
import { Money } from '../utils/money';
import { NotFoundError, ConflictError, BadRequestError } from '../middleware/errorHandler';
import type { CreateProductInput, UpdateProductInput, ProductQueryInput, CreateVariantInput, UpdateVariantInput } from '../validators/product.validator';

// ─── Product Service ───────────────────────────────────────────────────────────

export class ProductService {

  /** List products with pagination, search and filters */
  static async list(query: ProductQueryInput) {
    const { page, limit, search, status, category, type, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (category) filter.category = new RegExp(category, 'i');
    if (type) filter.type = new RegExp(type, 'i');
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { code: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    const sortField = sortBy === 'salesPrice' ? 'salesPrice' : sortBy;
    const sort: Record<string, 1 | -1> = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('taxRule', 'name code rate taxType')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    // Fetch variant counts
    const productIds = products.map((p: any) => p._id);
    const variantCounts = await ProductVariant.aggregate([
      { $match: { product: { $in: productIds }, status: { $ne: 'discontinued' } } },
      { $group: { _id: '$product', count: { $sum: 1 } } },
    ]);
    const countMap: Record<string, number> = {};
    variantCounts.forEach((v: any) => { countMap[v._id.toString()] = v.count; });

    const enriched = products.map((p: any) => ({
      ...p,
      variantsCount: countMap[p._id.toString()] ?? 0,
    }));

    return { products: enriched, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Get a single product by ID with variants */
  static async getById(id: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid product ID');
    }
    const product = await Product.findById(id)
      .populate('taxRule', 'name code rate taxType')
      .lean();
    if (!product) throw new NotFoundError('Product not found');

    const variants = await ProductVariant.find({ product: id }).lean();
    return { ...product, variants };
  }

  /** Create a new product */
  static async create(input: CreateProductInput, createdBy?: string) {
    // Check for duplicate code
    const existing = await Product.findOne({ code: input.code.toUpperCase() });
    if (existing) throw new ConflictError(`A product with code "${input.code}" already exists`);

    const productData: Record<string, any> = {
      name: input.name,
      code: input.code.toUpperCase(),
      description: input.description,
      category: input.category,
      type: input.type,
      salesPrice: Money.toDecimal128(input.salesPrice),
      costPrice: input.costPrice !== undefined ? Money.toDecimal128(input.costPrice) : undefined,
      notes: input.notes,
      status: input.status,
      isRecurring: input.isRecurring,
      slug: input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now(),
    };

    if (input.taxRule) productData.taxRule = input.taxRule;
    if (createdBy) productData.createdBy = createdBy;

    const product = await Product.create(productData);
    return product;
  }

  /** Update a product */
  static async update(id: string, input: UpdateProductInput) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestError('Invalid product ID');
    const product = await Product.findById(id);
    if (!product) throw new NotFoundError('Product not found');

    if (input.code && input.code !== product.code) {
      const conflict = await Product.findOne({ code: input.code.toUpperCase(), _id: { $ne: id } });
      if (conflict) throw new ConflictError(`A product with code "${input.code}" already exists`);
      (input as any).code = input.code.toUpperCase();
    }

    const updateData: Record<string, any> = { ...input };
    if (input.salesPrice !== undefined) updateData.salesPrice = Money.toDecimal128(input.salesPrice);
    if (input.costPrice !== undefined) updateData.costPrice = Money.toDecimal128(input.costPrice);

    const updated = await Product.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .populate('taxRule', 'name code rate taxType');
    return updated;
  }

  /** Archive a product */
  static async archive(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestError('Invalid product ID');
    const product = await Product.findByIdAndUpdate(id, { $set: { status: 'archived' } }, { new: true });
    if (!product) throw new NotFoundError('Product not found');
    return product;
  }

  /** Delete a product (admin only, checks for dependencies) */
  static async delete(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestError('Invalid product ID');
    const product = await Product.findById(id);
    if (!product) throw new NotFoundError('Product not found');

    // Remove variants
    await ProductVariant.deleteMany({ product: id });
    await Product.findByIdAndDelete(id);
    return true;
  }

  // ─── Variant Sub-operations ──────────────────────────────────────────────────

  /** Get all variants for a product */
  static async getVariants(productId: string) {
    if (!mongoose.Types.ObjectId.isValid(productId)) throw new BadRequestError('Invalid product ID');
    const product = await Product.findById(productId).lean();
    if (!product) throw new NotFoundError('Product not found');
    return ProductVariant.find({ product: productId }).lean();
  }

  /** Add a variant to a product */
  static async createVariant(productId: string, input: CreateVariantInput) {
    if (!mongoose.Types.ObjectId.isValid(productId)) throw new BadRequestError('Invalid product ID');
    const product = await Product.findById(productId).lean();
    if (!product) throw new NotFoundError('Product not found');

    // Calculate variant price: salesPrice + priceAdjustment
    const salesPrice = Money.from((product as any).salesPrice ?? 0);
    const adjustment = Money.from(input.priceAdjustment);
    const variantPrice = Money.add(salesPrice, adjustment);

    if (variantPrice.isNegative()) {
      throw new BadRequestError('Calculated variant price cannot be negative');
    }

    // Generate unique SKU
    const baseSku = `${(product as any).code}-${input.name.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`;
    const existingCount = await ProductVariant.countDocuments({ product: productId });
    const sku = `${baseSku}-V${existingCount + 1}`;

    const variant = await ProductVariant.create({
      product: productId,
      name: input.name,
      value: input.value,
      priceAdjustment: Money.toDecimal128(input.priceAdjustment),
      price: Money.toDecimal128(variantPrice),
      currency: (product as any).currency ?? 'USD',
      status: input.status,
      sku,
      attributes: [{ name: input.name, value: input.value }],
    });

    return variant;
  }

  /** Update a variant */
  static async updateVariant(productId: string, variantId: string, input: UpdateVariantInput) {
    if (!mongoose.Types.ObjectId.isValid(productId)) throw new BadRequestError('Invalid product ID');
    if (!mongoose.Types.ObjectId.isValid(variantId)) throw new BadRequestError('Invalid variant ID');

    const product = await Product.findById(productId).lean();
    if (!product) throw new NotFoundError('Product not found');

    const variant = await ProductVariant.findOne({ _id: variantId, product: productId });
    if (!variant) throw new NotFoundError('Variant not found');

    const updateData: Record<string, any> = { ...input };

    if (input.priceAdjustment !== undefined) {
      const salesPrice = Money.from((product as any).salesPrice ?? 0);
      const adjustment = Money.from(input.priceAdjustment);
      const variantPrice = Money.add(salesPrice, adjustment);
      if (variantPrice.isNegative()) {
        throw new BadRequestError('Calculated variant price cannot be negative');
      }
      updateData.priceAdjustment = Money.toDecimal128(input.priceAdjustment);
      updateData.price = Money.toDecimal128(variantPrice);
    }

    const updated = await ProductVariant.findByIdAndUpdate(variantId, { $set: updateData }, { new: true, runValidators: true });
    return updated;
  }

  /** Delete a variant */
  static async deleteVariant(productId: string, variantId: string) {
    if (!mongoose.Types.ObjectId.isValid(variantId)) throw new BadRequestError('Invalid variant ID');
    const variant = await ProductVariant.findOne({ _id: variantId, product: productId });
    if (!variant) throw new NotFoundError('Variant not found');
    await ProductVariant.findByIdAndDelete(variantId);
    return true;
  }
}
