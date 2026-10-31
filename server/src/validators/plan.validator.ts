import { z } from 'zod';

const BillingIntervalEnum = z.enum(['daily', 'weekly', 'monthly', 'yearly'], {
  errorMap: () => ({ message: 'Billing interval must be DAILY, WEEKLY, MONTHLY, or YEARLY' }),
});

// ─── Plan Validators ───────────────────────────────────────────────────────────

export const CreatePlanSchema = z
  .object({
    name: z.string().min(2, 'Plan name must be at least 2 characters').max(150),
    code: z
      .string()
      .min(1)
      .max(50)
      .toUpperCase()
      .regex(/^[A-Z0-9_-]+$/, 'Code must only contain uppercase letters, numbers, underscores, and hyphens'),
    description: z.string().max(1000).optional(),
    billingInterval: BillingIntervalEnum,
    billingPrice: z.number({ required_error: 'Billing price is required' }).min(0, 'Billing price cannot be negative'),
    currency: z.string().length(3, 'Currency must be a 3-letter ISO code').toUpperCase().default('USD'),
    minimumQuantity: z.number().int().min(1, 'Minimum quantity must be at least 1').default(1),
    startDate: z.coerce.date({ required_error: 'Start date is required' }),
    endDate: z.coerce.date().optional().nullable(),
    trialPeriodDays: z.number().int().min(0).default(0),
    setupFee: z.number().min(0).default(0),
    status: z.enum(['draft', 'active', 'archived']).default('active'),
    isPublic: z.boolean().default(true),
    taxRule: z.string().optional(),
    // Plan configuration options
    autoClose: z.boolean().default(true),
    allowEarlyClosure: z.boolean().default(false),
    allowPause: z.boolean().default(false),
    allowRenewal: z.boolean().default(true),
    // Associated products
    products: z
      .array(
        z.object({
          product: z.string().min(1, 'Product ID is required'),
          variant: z.string().optional(),
          quantity: z.number().int().min(1).default(1),
          unitPriceOverride: z.number().min(0).optional(),
          isOptional: z.boolean().default(false),
          pricingType: z.enum(['flat_fee', 'per_unit', 'tiered', 'volume']).default('per_unit'),
          sortOrder: z.number().int().default(0),
        })
      )
      .optional()
      .default([]),
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );

export const UpdatePlanSchema = CreatePlanSchema.partial().extend({
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

export const PlanQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  billingInterval: BillingIntervalEnum.optional(),
  isPublic: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'code', 'billingPrice', 'billingInterval', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreatePlanInput = z.infer<typeof CreatePlanSchema>;
export type UpdatePlanInput = z.infer<typeof UpdatePlanSchema>;
export type PlanQueryInput = z.infer<typeof PlanQuerySchema>;
