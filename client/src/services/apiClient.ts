import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { ENV } from '@/config/env';
import type { ApiErrorResponse, ApiResponse, User } from '@/types/api';

const TOKEN_KEY = 'sms_access_token';
const USER_KEY = 'sms_current_user';

export class ApiError extends Error {
  statusCode: number;
  errors?: { field: string; message: string }[];
  isNetworkError: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: { field: string; message: string }[],
    isNetworkError: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isNetworkError = isNetworkError;
  }
}

/**
 * Storage helpers for authentication session
 */
export const authStorage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // ignore storage write errors
    }
  },
  getUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setUser(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch {
      // ignore storage write errors
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  },
};

/**
 * Create centralized Axios instance
 */
const rawClient: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // For httpOnly refresh cookies
});

// Queue to hold requests while refreshing token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Request Interceptor
 */
rawClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor with Automatic Token Refresh Queue
 */
rawClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and request has not been retried yet
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return rawClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post<ApiResponse<{ accessToken: string }>>(
          `${ENV.API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        if (newAccessToken) {
          authStorage.setToken(newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          processQueue(null, newAccessToken);
          return rawClient(originalRequest);
        } else {
          throw new Error('No access token returned from refresh');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        authStorage.clear();
        // Notify window for logout redirect if needed
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      } finally {
        isRefreshing = false;
      }
    }

    // Standardize error presentation
    let message = 'An unexpected error occurred. Please try again.';
    let errors: { field: string; message: string }[] | undefined;
    const statusCode = error.response?.status || 500;
    const isNetworkError = !error.response;

    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data.message === 'string') {
        message = data.message;
      }
      if (Array.isArray(data.errors)) {
        errors = data.errors;
      }
    } else if (error.message) {
      if (error.code === 'ECONNABORTED') {
        message = 'Request timeout. The server took too long to respond.';
      } else if (error.message === 'Network Error') {
        message = 'Unable to reach the server. Please check your connection.';
      } else {
        message = error.message;
      }
    }

    return Promise.reject(new ApiError(message, statusCode, errors, isNetworkError));
  }
);

/**
 * Type-safe API Client Wrapper
 */
export const apiClient = {
  instance: rawClient,

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await rawClient.get<ApiResponse<T>>(url, config);
    return res.data;
  },

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const res = await rawClient.post<ApiResponse<T>>(url, data, config);
    return res.data;
  },

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const res = await rawClient.put<ApiResponse<T>>(url, data, config);
    return res.data;
  },

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const res = await rawClient.patch<ApiResponse<T>>(url, data, config);
    return res.data;
  },

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await rawClient.delete<ApiResponse<T>>(url, config);
    return res.data;
  },
};

export default apiClient;

