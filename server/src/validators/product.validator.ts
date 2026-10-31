import { z } from 'zod';

// ─── Product Validators ────────────────────────────────────────────────────────

export const CreateProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(200),
  code: z.string().min(1).max(50).toUpperCase().regex(/^[A-Z0-9_-]+$/, 'Code must only contain uppercase letters, numbers, underscores, and hyphens'),
  description: z.string().max(2000).optional(),
  category: z.string().min(1, 'Category is required').max(100),
  type: z.string().min(1, 'Type is required').max(100),
  salesPrice: z.number({ required_error: 'Sales price is required' }).min(0, 'Sales price cannot be negative'),
  costPrice: z.number().min(0, 'Cost price cannot be negative').optional(),
  notes: z.string().max(5000).optional(),
  status: z.enum(['draft', 'active', 'archived']).default('active'),
  isRecurring: z.boolean().default(true),
  taxRule: z.string().optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial().extend({
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  sortBy: z.enum(['name', 'code', 'salesPrice', 'category', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ─── Variant Validators ────────────────────────────────────────────────────────

export const CreateVariantSchema = z.object({
  name: z.string().min(2, 'Variant name must be at least 2 characters').max(150),
  value: z.string().min(1, 'Variant value is required').max(200),
  priceAdjustment: z.number({ required_error: 'Price adjustment is required' }),
  status: z.enum(['active', 'inactive', 'discontinued']).default('active'),
});

export const UpdateVariantSchema = CreateVariantSchema.partial();

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductQueryInput = z.infer<typeof ProductQuerySchema>;
export type CreateVariantInput = z.infer<typeof CreateVariantSchema>;
export type UpdateVariantInput = z.infer<typeof UpdateVariantSchema>;
