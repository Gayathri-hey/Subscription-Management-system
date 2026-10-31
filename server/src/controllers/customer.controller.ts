import { Request, Response } from 'express';
import { customerService } from '../services/customer.service';
import { ApiResponseHelper } from '../utils/apiResponse';
import { catchAsync } from '../utils/catchAsync';
import { UnauthorizedError } from '../middleware/errorHandler';

export class CustomerController {
  /**
   * Get authenticated customer profile
   * GET /api/customer/profile
   */
  public getProfile = catchAsync(async (req: Request, res: Response): Promise<void> => {
    if (!req.user?._id) {
      throw new UnauthorizedError('Authentication required');
    }

    const data = await customerService.getProfile(req.user._id.toString());
    ApiResponseHelper.sendSuccess(res, 'Customer profile retrieved', data);
  });

  /**
   * Update customer profile
   * PUT /api/customer/profile
   */
  public updateProfile = catchAsync(async (req: Request, res: Response): Promise<void> => {
    if (!req.user?._id) {
      throw new UnauthorizedError('Authentication required');
    }

    const data = await customerService.updateProfile(req.user._id.toString(), req.body);
    ApiResponseHelper.sendSuccess(res, 'Customer profile updated successfully', data);
  });

  /**
   * Change customer password
   * PUT /api/customer/password
   */
  public changePassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
    if (!req.user?._id) {
      throw new UnauthorizedError('Authentication required');
    }

    const { currentPassword, newPassword } = req.body;
    await customerService.changePassword(
      req.user._id.toString(),
      currentPassword,
      newPassword
    );

    ApiResponseHelper.sendSuccess(res, 'Password updated successfully');
  });
}

export const customerController = new CustomerController();

