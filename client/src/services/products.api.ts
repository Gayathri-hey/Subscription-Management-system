import { apiClient } from './apiClient';
import type { ApiResponse } from '@/types/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Product {
  _id: string;
  name: string;
  slug: string;
  code: string;
  description?: string;
  category: string;
  type: string;
  salesPrice: string;
  costPrice?: string;
  notes?: string;
  status: 'draft' | 'active' | 'archived';
  isRecurring: boolean;
  taxRule?: { _id: string; name: string; code: string; rate: string; taxType: string } | null;
  variantsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  _id: string;
  product: string;
  name: string;
  value: string;
  sku: string;
  price: string;
  priceAdjustment: string;
  currency: string;
  status: 'active' | 'inactive' | 'discontinued';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductPayload {
  name: string;
  code: string;
  category: string;
  type: string;
  salesPrice: number;
  costPrice?: number;
  description?: string;
  notes?: string;
  status?: 'draft' | 'active' | 'archived';
  isRecurring?: boolean;
  taxRule?: string;
}

export interface VariantPayload {
  name: string;
  value: string;
  priceAdjustment: number;
  status?: 'active' | 'inactive' | 'discontinued';
}

// ─── Products API ──────────────────────────────────────────────────────────────

export const productsApi = {
  list: (params?: ProductListQuery) =>
    apiClient.get<any>('/products', { params }),

  getById: (id: string) =>
    apiClient.get<Product & { variants: ProductVariant[] }>(`/products/${id}`),

  create: (data: ProductPayload) =>
    apiClient.post<Product>('/products', data),

  update: (id: string, data: Partial<ProductPayload>) =>
    apiClient.put<Product>(`/products/${id}`, data),

  archive: (id: string) =>
    apiClient.post<Product>(`/products/${id}/archive`, {}),

  delete: (id: string) =>
    apiClient.delete(`/products/${id}`),

  // Variants
  listVariants: (productId: string) =>
    apiClient.get<ProductVariant[]>(`/products/${productId}/variants`),

  createVariant: (productId: string, data: VariantPayload) =>
    apiClient.post<ProductVariant>(`/products/${productId}/variants`, data),

  updateVariant: (productId: string, variantId: string, data: Partial<VariantPayload>) =>
    apiClient.put<ProductVariant>(`/products/${productId}/variants/${variantId}`, data),

  deleteVariant: (productId: string, variantId: string) =>
    apiClient.delete(`/products/${productId}/variants/${variantId}`),
};
