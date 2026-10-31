import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponseHelper } from '../utils/apiResponse';
import { PlanService } from '../services/plan.service';
import { PlanQuerySchema, CreatePlanSchema, UpdatePlanSchema } from '../validators/plan.validator';

export const listPlans = catchAsync(async (req: Request, res: Response) => {
  const query = PlanQuerySchema.parse(req.query);
  const result = await PlanService.list(query);
  return ApiResponseHelper.sendPaginated(res, 'Plans retrieved successfully', result.plans, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
});

export const getPlan = catchAsync(async (req: Request, res: Response) => {
  const plan = await PlanService.getById(req.params.id);
  return ApiResponseHelper.sendSuccess(res, 'Plan retrieved successfully', plan);
});

export const createPlan = catchAsync(async (req: Request, res: Response) => {
  const input = CreatePlanSchema.parse(req.body);
  const plan = await PlanService.create(input);
  return ApiResponseHelper.sendCreated(res, 'Plan created successfully', plan);
});

export const updatePlan = catchAsync(async (req: Request, res: Response) => {
  const input = UpdatePlanSchema.parse(req.body);
  const plan = await PlanService.update(req.params.id, input);
  return ApiResponseHelper.sendSuccess(res, 'Plan updated successfully', plan);
});

export const archivePlan = catchAsync(async (req: Request, res: Response) => {
  const plan = await PlanService.archive(req.params.id);
  return ApiResponseHelper.sendSuccess(res, 'Plan archived successfully', plan);
});

export const deletePlan = catchAsync(async (req: Request, res: Response) => {
  await PlanService.delete(req.params.id);
  return ApiResponseHelper.sendSuccess(res, 'Plan deleted successfully');
});

export const checkPlanAvailability = catchAsync(async (req: Request, res: Response) => {
  const result = await PlanService.isAvailable(req.params.id);
  return ApiResponseHelper.sendSuccess(res, 'Plan availability checked', result);
});
