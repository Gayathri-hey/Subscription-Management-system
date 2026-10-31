import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponseHelper } from '../utils/apiResponse';
import { ProductService } from '../services/product.service';
import { ProductQuerySchema, CreateProductSchema, UpdateProductSchema, CreateVariantSchema, UpdateVariantSchema } from '../validators/product.validator';
import { ValidationError } from '../middleware/errorHandler';

// ─── Product CRUD ──────────────────────────────────────────────────────────────

export const listProducts = catchAsync(async (req: Request, res: Response) => {
  const query = ProductQuerySchema.parse(req.query);
  const result = await ProductService.list(query);
  return ApiResponseHelper.sendPaginated(res, 'Products retrieved successfully', result.products, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
});

export const getProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await ProductService.getById(req.params.id);
  return ApiResponseHelper.sendSuccess(res, 'Product retrieved successfully', product);
});

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const input = CreateProductSchema.parse(req.body);
  const product = await ProductService.create(input, req.user?._id?.toString());
  return ApiResponseHelper.sendCreated(res, 'Product created successfully', product);
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const input = UpdateProductSchema.parse(req.body);
  const product = await ProductService.update(req.params.id, input);
  return ApiResponseHelper.sendSuccess(res, 'Product updated successfully', product);
});

export const archiveProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await ProductService.archive(req.params.id);
  return ApiResponseHelper.sendSuccess(res, 'Product archived successfully', product);
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  await ProductService.delete(req.params.id);
  return ApiResponseHelper.sendSuccess(res, 'Product deleted successfully');
});

// ─── Variant Sub-routes ────────────────────────────────────────────────────────

export const listVariants = catchAsync(async (req: Request, res: Response) => {
  const variants = await ProductService.getVariants(req.params.id);
  return ApiResponseHelper.sendSuccess(res, 'Variants retrieved successfully', variants);
});

export const createVariant = catchAsync(async (req: Request, res: Response) => {
  const input = CreateVariantSchema.parse(req.body);
  const variant = await ProductService.createVariant(req.params.id, input);
  return ApiResponseHelper.sendCreated(res, 'Variant created successfully', variant);
});

export const updateVariant = catchAsync(async (req: Request, res: Response) => {
  const input = UpdateVariantSchema.parse(req.body);
  const variant = await ProductService.updateVariant(req.params.id, req.params.variantId, input);
  return ApiResponseHelper.sendSuccess(res, 'Variant updated successfully', variant);
});

export const deleteVariant = catchAsync(async (req: Request, res: Response) => {
  await ProductService.deleteVariant(req.params.id, req.params.variantId);
  return ApiResponseHelper.sendSuccess(res, 'Variant deleted successfully');
});
