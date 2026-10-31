/**
 * Standard API Response Structures matching backend contracts
 */

export interface ApiResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  meta?: ApiResponseMeta;
}

export interface ApiValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ApiValidationError[];
  statusCode?: number;
}

import type { Role } from './roles';
export type { Role };

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  avatarUrl?: string;
  phone?: string;
  company?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

