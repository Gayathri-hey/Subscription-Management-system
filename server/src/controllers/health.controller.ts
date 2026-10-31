import { Request, Response } from 'express';
import { healthService } from '../services/health.service';
import { ApiResponseHelper } from '../utils/apiResponse';
import { catchAsync } from '../utils/catchAsync';

export class HealthController {
  /**
   * Health check endpoint handler
   * GET /api/health
   */
  public checkHealth = catchAsync(async (_req: Request, res: Response): Promise<void> => {
    const health = await healthService.getHealthStatus();
    const httpStatus = health.status === 'DOWN' ? 503 : 200;

    ApiResponseHelper.sendSuccess(
      res,
      'Subscription Management System API is running',
      health,
      httpStatus
    );
  });
}

export const healthController = new HealthController();

