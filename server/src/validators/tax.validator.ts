import { z } from 'zod';

export const CreateTaxRuleSchema = z.object({
  name: z.string().min(2, 'Tax rule name must be at least 2 characters').max(100),
  code: z
    .string()
    .min(1)
    .max(50)
    .toUpperCase()
    .regex(/^[A-Z0-9_-]+$/, 'Code must only contain uppercase letters, numbers, underscores, and hyphens'),
  taxType: z.enum(['sales_tax', 'vat', 'gst', 'custom'], {
    errorMap: () => ({ message: 'Invalid tax type' }),
  }),
  rate: z
    .number({ required_error: 'Tax rate is required' })
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%'),
  country: z.string().length(2, 'Country code must be exactly 2 characters').toUpperCase(),
  state: z.string().max(50).toUpperCase().optional(),
  postalCode: z.string().max(20).optional(),
  isCompound: z.boolean().default(false),
  isInclusive: z.boolean().default(false),
  status: z.enum(['active', 'inactive', 'deprecated']).default('active'),
  effectiveFrom: z.coerce.date().default(() => new Date()),
  effectiveUntil: z.coerce.date().optional().nullable(),
});

export const UpdateTaxRuleSchema = CreateTaxRuleSchema.partial().extend({
  status: z.enum(['active', 'inactive', 'deprecated']).optional(),
});

export const TaxRuleQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'deprecated']).optional(),
  taxType: z.enum(['sales_tax', 'vat', 'gst', 'custom']).optional(),
  country: z.string().optional(),
  sortBy: z.enum(['name', 'code', 'rate', 'country', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const CalculateTaxSchema = z.object({
  amount: z.number().min(0, 'Amount cannot be negative'),
  taxRuleId: z.string().min(1, 'Tax rule ID is required'),
  quantity: z.number().int().min(1).default(1),
});

export type CreateTaxRuleInput = z.infer<typeof CreateTaxRuleSchema>;
export type UpdateTaxRuleInput = z.infer<typeof UpdateTaxRuleSchema>;
export type TaxRuleQueryInput = z.infer<typeof TaxRuleQuerySchema>;
export type CalculateTaxInput = z.infer<typeof CalculateTaxSchema>;
