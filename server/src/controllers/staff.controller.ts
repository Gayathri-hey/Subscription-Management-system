import { Request, Response } from 'express';
import { staffService } from '../services/staff.service';
import { ApiResponseHelper } from '../utils/apiResponse';
import { catchAsync } from '../utils/catchAsync';

export class StaffController {
  /**
   * Create staff account (Admin only)
   * POST /api/staff
   */
  public createStaff = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const staff = await staffService.createStaff(req.body);

    ApiResponseHelper.sendCreated(res, 'Staff account created successfully', staff);
  });

  /**
   * List staff accounts (Admin only)
   * GET /api/staff
   */
  public listStaff = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = req.query.search as string;

    const { staff, meta } = await staffService.listStaff(page, limit, search);

    ApiResponseHelper.sendPaginated(res, 'Staff accounts retrieved', staff, meta);
  });

  /**
   * Get staff member by ID (Admin only)
   * GET /api/staff/:id
   */
  public getStaffById = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const staff = await staffService.getStaffById(req.params.id);

    ApiResponseHelper.sendSuccess(res, 'Staff member retrieved', staff);
  });

  /**
   * Update staff member details (Admin only)
   * PUT /api/staff/:id
   */
  public updateStaff = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const staff = await staffService.updateStaff(req.params.id, req.body);

    ApiResponseHelper.sendSuccess(res, 'Staff member updated successfully', staff);
  });

  /**
   * Update staff account status (Admin only)
   * PATCH /api/staff/:id/status
   */
  public updateStaffStatus = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const staff = await staffService.updateStaffStatus(req.params.id, req.body.status);

    ApiResponseHelper.sendSuccess(
      res,
      `Staff account status updated to ${req.body.status}`,
      staff
    );
  });
}

export const staffController = new StaffController();

