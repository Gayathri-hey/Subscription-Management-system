/**
 * Application environment configuration
 * Provides type-safe access to Vite environment variables with runtime fallbacks.
 */
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Subscription Management System',
  APP_ENV: (import.meta.env.VITE_APP_ENV || 'development') as 'development' | 'staging' | 'production',
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  IS_PROD: import.meta.env.PROD,
  IS_DEV: import.meta.env.DEV,
} as const;

export default ENV;

