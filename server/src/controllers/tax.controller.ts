import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponseHelper } from '../utils/apiResponse';
import { TaxService } from '../services/tax.service';
import { TaxRuleQuerySchema, CreateTaxRuleSchema, UpdateTaxRuleSchema, CalculateTaxSchema } from '../validators/tax.validator';
import { z } from 'zod';

export const listTaxRules = catchAsync(async (req: Request, res: Response) => {
  const query = TaxRuleQuerySchema.parse(req.query);
  const result = await TaxService.list(query);
  return ApiResponseHelper.sendPaginated(res, 'Tax rules retrieved successfully', result.taxRules, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
});

export const getTaxRule = catchAsync(async (req: Request, res: Response) => {
  const taxRule = await TaxService.getById(req.params.id);
  return ApiResponseHelper.sendSuccess(res, 'Tax rule retrieved successfully', taxRule);
});

export const createTaxRule = catchAsync(async (req: Request, res: Response) => {
  const input = CreateTaxRuleSchema.parse(req.body);
  const taxRule = await TaxService.create(input);
  return ApiResponseHelper.sendCreated(res, 'Tax rule created successfully', taxRule);
});

export const updateTaxRule = catchAsync(async (req: Request, res: Response) => {
  const input = UpdateTaxRuleSchema.parse(req.body);
  const taxRule = await TaxService.update(req.params.id, input);
  return ApiResponseHelper.sendSuccess(res, 'Tax rule updated successfully', taxRule);
});

export const toggleTaxRuleStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = z.object({ status: z.enum(['active', 'inactive', 'deprecated']) }).parse(req.body);
  const taxRule = await TaxService.toggleStatus(req.params.id, status);
  return ApiResponseHelper.sendSuccess(res, `Tax rule status set to "${status}"`, taxRule);
});

export const calculateTax = catchAsync(async (req: Request, res: Response) => {
  const { amount, taxRuleId, quantity } = CalculateTaxSchema.parse(req.body);
  const result = await TaxService.calculate(amount, taxRuleId, quantity);
  return ApiResponseHelper.sendSuccess(res, 'Tax calculated successfully', result);
});

export const getApplicableTaxRules = catchAsync(async (req: Request, res: Response) => {
  const { country, state } = z.object({
    country: z.string().length(2).toUpperCase(),
    state: z.string().optional(),
  }).parse(req.query);
  const rules = await TaxService.getApplicableRules(country, state);
  return ApiResponseHelper.sendSuccess(res, 'Applicable tax rules retrieved', rules);
});
