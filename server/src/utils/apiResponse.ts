import { Response } from 'express';
import { ApiResponse, FieldError, PaginationMeta } from '../types';

export class ApiResponseHelper {
  /**
   * Send a standard successful response
   */
  public static sendSuccess<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode = 200,
    meta?: PaginationMeta
  ): Response {
    const payload: ApiResponse<T> = {
      success: true,
      message,
      ...(data !== undefined && { data }),
      ...(meta !== undefined && { meta }),
    };

    return res.status(statusCode).json(payload);
  }

  /**
   * Send a 201 Created response
   */
  public static sendCreated<T>(
    res: Response,
    message: string,
    data?: T
  ): Response {
    return this.sendSuccess(res, message, data, 201);
  }

  /**
   * Send a paginated response
   */
  public static sendPaginated<T>(
    res: Response,
    message: string,
    data: T,
    meta: PaginationMeta,
    statusCode = 200
  ): Response {
    return this.sendSuccess(res, message, data, statusCode, meta);
  }

  /**
   * Send a standard error response
   */
  public static sendError(
    res: Response,
    message: string,
    statusCode = 500,
    errors?: FieldError[]
  ): Response {
    const payload: ApiResponse = {
      success: false,
      message,
      ...(errors && errors.length > 0 && { errors }),
    };

    return res.status(statusCode).json(payload);
  }
}

