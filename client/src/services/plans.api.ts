import { apiClient } from './apiClient';

export interface Plan {
  _id: string;
  name: string;
  code: string;
  description?: string;
  basePrice: string;
  currency: string;
  billingCycle: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'quarterly' | 'semi_annual' | 'one_time';
  billingInterval: number;
  trialPeriodDays: number;
  setupFee: string;
  minimumQuantity: number;
  startDate: string;
  endDate?: string | null;
  autoClose: boolean;
  allowEarlyClosure: boolean;
  allowPause: boolean;
  allowRenewal: boolean;
  status: 'draft' | 'active' | 'archived';
  isPublic: boolean;
  taxRule?: { _id: string; name: string; code: string; rate: string; taxType: string } | null;
  products?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface PlanListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  billingInterval?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PlanPayload {
  name: string;
  code: string;
  description?: string;
  billingInterval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  billingPrice: number;
  currency?: string;
  minimumQuantity?: number;
  startDate: string | Date;
  endDate?: string | Date | null;
  trialPeriodDays?: number;
  setupFee?: number;
  status?: 'draft' | 'active' | 'archived';
  isPublic?: boolean;
  taxRule?: string;
  autoClose?: boolean;
  allowEarlyClosure?: boolean;
  allowPause?: boolean;
  allowRenewal?: boolean;
  products?: Array<{
    product: string;
    variant?: string;
    quantity?: number;
    unitPriceOverride?: number;
    isOptional?: boolean;
    pricingType?: string;
    sortOrder?: number;
  }>;
}

export const plansApi = {
  list: (params?: PlanListQuery) =>
    apiClient.get<any>('/plans', { params }),

  getById: (id: string) =>
    apiClient.get<Plan>(`/plans/${id}`),

  create: (data: PlanPayload) =>
    apiClient.post<Plan>('/plans', data),

  update: (id: string, data: Partial<PlanPayload>) =>
    apiClient.put<Plan>(`/plans/${id}`, data),

  archive: (id: string) =>
    apiClient.post<Plan>(`/plans/${id}/archive`, {}),

  delete: (id: string) =>
    apiClient.delete(`/plans/${id}`),

  checkAvailability: (id: string) =>
    apiClient.get<{ available: boolean; reason?: string }>(`/plans/${id}/available`),
};
