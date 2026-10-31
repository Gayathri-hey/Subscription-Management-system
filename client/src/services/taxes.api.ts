import { apiClient } from './apiClient';

export interface TaxRule {
  _id: string;
  name: string;
  code: string;
  taxType: 'sales_tax' | 'vat' | 'gst' | 'custom';
  rate: string;
  country: string;
  state?: string;
  postalCode?: string;
  isCompound: boolean;
  isInclusive: boolean;
  status: 'active' | 'inactive' | 'deprecated';
  effectiveFrom: string;
  effectiveUntil?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaxListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  taxType?: string;
  country?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TaxRulePayload {
  name: string;
  code: string;
  taxType: 'sales_tax' | 'vat' | 'gst' | 'custom';
  rate: number;
  country: string;
  state?: string;
  postalCode?: string;
  isCompound?: boolean;
  isInclusive?: boolean;
  status?: 'active' | 'inactive' | 'deprecated';
  effectiveFrom?: string | Date;
  effectiveUntil?: string | Date | null;
}

export interface TaxCalculationResult {
  taxRuleId: string;
  taxRuleName: string;
  taxType: string;
  ratePercentage: string;
  isInclusive: boolean;
  isCompound: boolean;
  baseAmount: string;
  taxAmount: string;
  totalAmount: string;
}

export const taxesApi = {
  list: (params?: TaxListQuery) =>
    apiClient.get<any>('/taxes', { params }),

  getById: (id: string) =>
    apiClient.get<TaxRule>(`/taxes/${id}`),

  create: (data: TaxRulePayload) =>
    apiClient.post<TaxRule>('/taxes', data),

  update: (id: string, data: Partial<TaxRulePayload>) =>
    apiClient.put<TaxRule>(`/taxes/${id}`, data),

  toggleStatus: (id: string, status: 'active' | 'inactive' | 'deprecated') =>
    apiClient.patch<TaxRule>(`/taxes/${id}/status`, { status }),

  calculate: (amount: number, taxRuleId: string, quantity?: number) =>
    apiClient.post<TaxCalculationResult>('/taxes/calculate', { amount, taxRuleId, quantity }),

  getApplicable: (country: string, state?: string) =>
    apiClient.get<TaxRule[]>('/taxes/applicable', { params: { country, state } }),
};
